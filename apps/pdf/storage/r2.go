package storage

import (
	"fmt"
	"os"
	"path/filepath"
)

func SavePDF(filename string, data []byte) (string, int, error) {
	storageProvider := os.Getenv("STORAGE_PROVIDER")

	// Auto-detect provider if not explicitly defined
	if storageProvider == "" {
		if os.Getenv("CLOUDINARY_CLOUD_NAME") != "" && os.Getenv("CLOUDINARY_API_KEY") != "" && os.Getenv("CLOUDINARY_API_SECRET") != "" {
			storageProvider = "cloudinary"
		} else if os.Getenv("R2_ACCESS_KEY_ID") != "" {
			storageProvider = "r2"
		} else {
			storageProvider = "local"
		}
	}

	if storageProvider == "cloudinary" {
		url, err := UploadToCloudinary(filename, data)
		if err == nil {
			return url, len(data), nil
		}
		fmt.Printf("Cloudinary upload failed: %v. Falling back to local storage.\n", err)
	} else if storageProvider == "r2" {
		r2AccessKey := os.Getenv("R2_ACCESS_KEY_ID")
		if r2AccessKey != "" {
			// Stub R2 upload: If real credentials were provided, we would upload to S3/R2 here.
			// Currently, we fall back to local disk storage for dev testing.
		}
	}

	// Local storage fallback
	// Resolve relative path to apps/api/public/pdfs
	apiPublicDir := "../api/public/pdfs"
	
	err := os.MkdirAll(apiPublicDir, 0755)
	if err != nil {
		// Try fallback if running from root directory
		apiPublicDir = "apps/api/public/pdfs"
		err = os.MkdirAll(apiPublicDir, 0755)
		if err != nil {
			return "", 0, fmt.Errorf("failed to create local pdf directory: %w", err)
		}
	}

	filePath := filepath.Join(apiPublicDir, filename)
	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		return "", 0, fmt.Errorf("failed to write local pdf file: %w", err)
	}

	size := len(data)
	// NestJS serves static files from /public/ prefix
	pdfUrl := fmt.Sprintf("http://localhost:8000/public/pdfs/%s", filename)

	return pdfUrl, size, nil
}
