package handlers

import (
	"fmt"
	"net/http"
	"pdf/renderer"
	"pdf/storage"

	"github.com/labstack/echo/v4"
)

type ProposalData struct {
	ProposalId string `json:"proposalId"`
	Title      string `json:"title"`
	ValidUntil string `json:"validUntil"`
	Currency   string `json:"currency"`
	Workspace  struct {
		Name       string `json:"name"`
		LogoUrl    string `json:"logoUrl"`
		BrandColor string `json:"brandColor"`
		Email      string `json:"email"`
		Address    string `json:"address"`
		TaxNumber  string `json:"taxNumber"`
	} `json:"workspace"`
	Client struct {
		Name    string `json:"name"`
		Company string `json:"company"`
		Email   string `json:"email"`
		Address string `json:"address"`
	} `json:"client"`
	LineItems []struct {
		Description string  `json:"description"`
		Quantity    float64 `json:"quantity"`
		Rate        float64 `json:"rate"`
		TaxRate     float64 `json:"taxRate"`
		Amount      float64 `json:"amount"`
	} `json:"lineItems"`
	Subtotal   float64 `json:"subtotal"`
	TaxTotal   float64 `json:"taxTotal"`
	Total      float64 `json:"total"`
	Intro      string  `json:"intro"`
}

func GenerateProposalPDF(c echo.Context) error {
	data := new(ProposalData)
	if err := c.Bind(data); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	// 1. Render HTML Template
	htmlStr, err := renderer.RenderTemplate("proposal.html", data)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("Template rendering failed: %v", err)})
	}

	// 2. Generate PDF via Chromedp
	pdfBytes, err := renderer.HTMLToPDF(htmlStr)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("PDF generation failed: %v", err)})
	}

	// 3. Save PDF
	filename := fmt.Sprintf("proposal_%s.pdf", data.ProposalId)
	pdfUrl, sizeBytes, err := storage.SavePDF(filename, pdfBytes)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("Saving PDF failed: %v", err)})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"pdfUrl":    pdfUrl,
		"sizeBytes": sizeBytes,
	})
}
