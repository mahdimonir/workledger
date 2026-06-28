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
	_ = godotenv.Load("../api/.env")
	_ = godotenv.Load("apps/api/.env")
	_ = godotenv.Load()

	e := echo.New()

	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "WorkLedger PDF Service Active"})
	})
	e.HEAD("/", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

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
