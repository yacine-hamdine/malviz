import os
import json
import subprocess
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser


class AnalyzeFileView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=400)

        # Save file temporarily
        file_path = os.path.join(settings.MEDIA_ROOT, file.name)
        with open(file_path, "wb+") as f:
            for chunk in file.chunks():
                f.write(chunk)

        try:
            # Run AI engine as subprocess
            process = subprocess.run(
                ["python3", "path/to/ai_engine.py", file_path],
                capture_output=True,
                text=True,
                check=True
            )

            result = json.loads(process.stdout)
            return Response(result)

        except subprocess.CalledProcessError as e:
            return Response({
                "error": "AI engine process failed",
                "details": e.stderr
            }, status=500)
        except json.JSONDecodeError:
            return Response({
                "error": "Failed to parse AI engine output"
            }, status=500)
