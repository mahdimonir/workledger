package main

import (
	"log"
	"net/http"
	"os"
	"pdf/handlers"
	"pdf/middleware"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	// Load environment variables from .env files
	_ = godotenv.Load("../api/.env")    // relative to apps/pdf
	_ = godotenv.Load("apps/api/.env")  // relative to workspace root
	_ = godotenv.Load()                 // local directory

	e := echo.New()

	// Middleware
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())

	// Health checks and status
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "WorkLedger PDF Service Active"})
	})
	e.HEAD("/", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	// PDF Routes (protected by AuthMiddleware)
	pdfGroup := e.Group("/pdf")
	pdfGroup.Use(middleware.AuthMiddleware)
	pdfGroup.POST("/invoice", handlers.GenerateInvoicePDF)
	pdfGroup.POST("/proposal", handlers.GenerateProposalPDF)

	port := os.Getenv("PORT")
	if port == "" || port == "8000" {
		port = "8080"
	}

	log.Printf("Starting PDF Microservice on port %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("Shutting down the server: %v", err)
	}
}
