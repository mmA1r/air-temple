package imageprocessor

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"strings"

	"air-temple/backend/internal/models"
)

func GeneratePreview(original []byte, mimeType string, variantKey string) ([]byte, models.AssetVariant, bool, error) {
	if !strings.HasPrefix(mimeType, "image/") {
		return nil, models.AssetVariant{}, false, nil
	}

	source, _, err := image.Decode(bytes.NewReader(original))
	if err != nil {
		return nil, models.AssetVariant{}, false, err
	}

	resized := resizeToWidth(source, 1600)
	bounds := resized.Bounds()
	buffer := bytes.NewBuffer(nil)

	if mimeType == "image/png" {
		err = png.Encode(buffer, resized)
	} else {
		err = jpeg.Encode(buffer, resized, &jpeg.Options{Quality: 86})
	}

	if err != nil {
		return nil, models.AssetVariant{}, false, err
	}

	return buffer.Bytes(), models.AssetVariant{
		Name:   variantKey,
		Width:  bounds.Dx(),
		Height: bounds.Dy(),
	}, true, nil
}

func DecodeConfig(reader io.Reader) (image.Config, string, error) {
	return image.DecodeConfig(reader)
}

func resizeToWidth(source image.Image, maxWidth int) image.Image {
	bounds := source.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if width <= maxWidth {
		return source
	}

	nextWidth := maxWidth
	nextHeight := height * nextWidth / width
	target := image.NewRGBA(image.Rect(0, 0, nextWidth, nextHeight))

	for y := 0; y < nextHeight; y++ {
		for x := 0; x < nextWidth; x++ {
			sourceX := bounds.Min.X + x*width/nextWidth
			sourceY := bounds.Min.Y + y*height/nextHeight
			target.Set(x, y, source.At(sourceX, sourceY))
		}
	}

	return target
}
