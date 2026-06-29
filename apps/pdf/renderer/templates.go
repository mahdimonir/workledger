package renderer

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"
)

func RenderTemplate(templateName string, data interface{}) (string, error) {
	
	templatePath := filepath.Join("templates", templateName)
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		
		templatePath = filepath.Join("apps", "pdf", "templates", templateName)
		tmpl, err = template.ParseFiles(templatePath)
		if err != nil {
			return "", fmt.Errorf("failed to parse template %s: %w", templateName, err)
		}
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, data)
	if err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}
