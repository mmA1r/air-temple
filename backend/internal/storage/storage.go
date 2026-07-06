package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"
	"time"

	"air-temple/backend/internal/config"
	"air-temple/backend/internal/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Client struct {
	bucket         string
	publicEndpoint string
	s3             *s3.Client
	presign        *s3.PresignClient
}

func New(ctx context.Context, cfg config.Config) (*Client, error) {
	awsCfg, err := awsconfig.LoadDefaultConfig(
		ctx,
		awsconfig.WithRegion(cfg.S3Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.S3AccessKey, cfg.S3SecretKey, "")),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(awsCfg, func(options *s3.Options) {
		options.BaseEndpoint = aws.String(cfg.S3Endpoint)
		options.UsePathStyle = cfg.S3UsePathStyle
	})

	return &Client{
		bucket:         cfg.S3Bucket,
		publicEndpoint: strings.TrimRight(cfg.S3PublicEndpoint, "/"),
		s3:             client,
		presign:        s3.NewPresignClient(client),
	}, nil
}

func (client *Client) Put(ctx context.Context, key string, contentType string, reader io.Reader) error {
	_, err := client.s3.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(client.bucket),
		Key:         aws.String(key),
		Body:        reader,
		ContentType: aws.String(contentType),
	})

	return err
}

func (client *Client) Get(ctx context.Context, key string) ([]byte, error) {
	result, err := client.s3.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(client.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	defer result.Body.Close()

	return io.ReadAll(result.Body)
}

func (client *Client) Delete(ctx context.Context, key string) error {
	_, err := client.s3.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(client.bucket),
		Key:    aws.String(key),
	})

	return err
}

func (client *Client) PublicURL(asset models.Asset) string {
	escapedKey := (&url.URL{Path: path.Join(client.bucket, asset.StorageKey)}).EscapedPath()

	return client.publicEndpoint + escapedKey
}

func (client *Client) SignedURL(ctx context.Context, asset models.Asset) (string, error) {
	result, err := client.presign.PresignGetObject(
		ctx,
		&s3.GetObjectInput{
			Bucket:                     aws.String(client.bucket),
			Key:                        aws.String(asset.StorageKey),
			ResponseContentDisposition: aws.String(fmt.Sprintf("attachment; filename=%q", asset.OriginalFileName)),
		},
		func(options *s3.PresignOptions) {
			options.Expires = 15 * time.Minute
		},
	)
	if err != nil {
		return "", err
	}

	return result.URL, nil
}

func ReaderFromBytes(data []byte) io.Reader {
	return bytes.NewReader(data)
}
