package handlers

import (
	"fmt"
	"net/http"
	"pdf/renderer"
	"pdf/storage"

	"github.com/labstack/echo/v4"
)

type InvoiceData struct {
	InvoiceId     string `json:"invoiceId"`
	InvoiceNumber string `json:"invoiceNumber"`
	IssuedDate    string `json:"issuedDate"`
	DueDate       string `json:"dueDate"`
	Currency      string `json:"currency"`
	Workspace     struct {
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
	AmountDue  float64 `json:"amountDue"`
	Notes      string  `json:"notes"`
}

func GenerateInvoicePDF(c echo.Context) error {
	data := new(InvoiceData)
	if err := c.Bind(data); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	
	htmlStr, err := renderer.RenderTemplate("invoice.html", data)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("Template rendering failed: %v", err)})
	}

	
	pdfBytes, err := renderer.HTMLToPDF(htmlStr)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("PDF generation failed: %v", err)})
	}

	
	filename := fmt.Sprintf("invoice_%s.pdf", data.InvoiceId)
	pdfUrl, sizeBytes, err := storage.SavePDF(filename, pdfBytes)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("Saving PDF failed: %v", err)})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"pdfUrl":    pdfUrl,
		"sizeBytes": sizeBytes,
	})
}
