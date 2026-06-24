package storage

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

type CloudinaryResponse struct {
	SecureURL string `json:"secure_url"`
	Error     struct {
		Message string `json:"message"`
	} `json:"error"`
}

func getSignature(params map[string]string, apiSecret string) string {
	var keys []string
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var parts []string
	for _, k := range keys {
		parts = append(parts, fmt.Sprintf("%s=%s", k, params[k]))
	}

	joined := strings.Join(parts, "&")
	joined += apiSecret

	hash := sha1.New()
	hash.Write([]byte(joined))
	return hex.EncodeToString(hash.Sum(nil))
}

func UploadToCloudinary(filename string, data []byte) (string, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")
	folder := os.Getenv("CLOUDINARY_FOLDER")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return "", fmt.Errorf("missing Cloudinary configuration environment variables")
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	// Create public ID by removing extension
	publicID := filename
	if len(publicID) > 4 && publicID[len(publicID)-4:] == ".pdf" {
		publicID = publicID[:len(publicID)-4]
	}

	// Prepare signature params
	sigParams := map[string]string{
		"timestamp": timestamp,
		"public_id": publicID,
	}
	if folder != "" {
		sigParams["folder"] = folder
	}

	signature := getSignature(sigParams, apiSecret)

	// Prepare request body
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add file field
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := io.Copy(part, bytes.NewReader(data)); err != nil {
		return "", fmt.Errorf("failed to copy file data: %w", err)
	}

	// Add fields
	_ = writer.WriteField("api_key", apiKey)
	_ = writer.WriteField("timestamp", timestamp)
	_ = writer.WriteField("public_id", publicID)
	_ = writer.WriteField("signature", signature)
	if folder != "" {
		_ = writer.WriteField("folder", folder)
	}

	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Make HTTP POST request to auto upload endpoint
	url := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/auto/upload", cloudName)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return "", fmt.Errorf("failed to create http request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errRes CloudinaryResponse
		_ = json.Unmarshal(respBody, &errRes)
		errMsg := errRes.Error.Message
		if errMsg == "" {
			errMsg = string(respBody)
		}
		return "", fmt.Errorf("cloudinary upload failed with status %d: %s", resp.StatusCode, errMsg)
	}

	var successRes CloudinaryResponse
	if err := json.Unmarshal(respBody, &successRes); err != nil {
		return "", fmt.Errorf("failed to decode JSON response: %w", err)
	}

	return successRes.SecureURL, nil
}
