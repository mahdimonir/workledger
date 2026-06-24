package renderer

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

func HTMLToPDF(htmlContent string) ([]byte, error) {
	// Create chromedp context
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	var buf []byte

	// JSON marshal safely escapes HTML for JS injection
	escapedHTML, err := json.Marshal(htmlContent)
	if err != nil {
		return nil, fmt.Errorf("failed to JSON escape HTML content: %w", err)
	}

	jsExpr := fmt.Sprintf(`document.open(); document.write(%s); document.close();`, string(escapedHTML))

	err = chromedp.Run(ctx,
		chromedp.Navigate("about:blank"),
		chromedp.Evaluate(jsExpr, nil),
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			// Generate PDF in A4 format with backgrounds enabled
			buf, _, err = page.PrintToPDF().
				WithPrintBackground(true).
				WithPaperWidth(8.27).
				WithPaperHeight(11.69).
				WithMarginTop(0.4).
				WithMarginBottom(0.4).
				WithMarginLeft(0.4).
				WithMarginRight(0.4).
				Do(ctx)
			return err
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("chromedp PDF generation failed: %w", err)
	}

	return buf, nil
}
