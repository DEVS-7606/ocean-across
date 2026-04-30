import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Ensure the MinIO/S3 bucket exists'

    def handle(self, *args, **options):
        try:
            s3 = boto3.client(
                's3',
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            try:
                s3.head_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
            except ClientError:
                s3.create_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
                # Set bucket policy to public-read
                import json
                policy = json.dumps({
                    "Version": "2012-10-17",
                    "Statement": [{
                        "Effect": "Allow",
                        "Principal": {"AWS": "*"},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{settings.AWS_STORAGE_BUCKET_NAME}/*"]
                    }]
                })
                s3.put_bucket_policy(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Policy=policy)
                self.stdout.write(self.style.SUCCESS(f'Created bucket: {settings.AWS_STORAGE_BUCKET_NAME}'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Bucket setup skipped: {e}'))
