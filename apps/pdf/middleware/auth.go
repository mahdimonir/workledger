package middleware

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
)

func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		secret := os.Getenv("PDF_SERVICE_SECRET")
		if secret == "" {
			secret = "local-dev-secret" 
		}

		clientSecret := c.Request().Header.Get("X-Internal-Secret")
		if clientSecret != secret {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "Unauthorized: Invalid internal secret",
			})
		}

		return next(c)
	}
}
