@echo off
echo 🚀 AI Chatbot - Quick Start
echo ==========================
echo.

REM Check if Docker is running
echo 🔍 Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Download from: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Start Docker services first
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for Ollama to be ready
echo ⏳ Waiting for Ollama to be ready...
for /L %%i in (1,1,30) do (
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Ollama is ready
        goto :ollama_ready
    )
    timeout /t 2 /nobreak >nul
)
echo ❌ Ollama failed to start
pause
exit /b 1

:ollama_ready

REM Check if required models are installed
echo 🤖 Installing optimal AI models for chatbot...

REM Install Phi-3 Mini (3.8B) - Fast, good quality, perfect for chatbots
curl -s http://localhost:11434/api/tags | findstr "phi3:mini" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ phi3:mini is installed
) else (
    echo 📥 Installing phi3:mini (3.8B) - Fast ^& High Quality...
    docker exec ai-chatbot-ollama ollama pull phi3:mini
)

REM Install Gemma 2B - Very lightweight, great for quick responses
curl -s http://localhost:11434/api/tags | findstr "gemma:2b" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ gemma:2b is installed
) else (
    echo 📥 Installing gemma:2b (2B) - Ultra Lightweight...
    docker exec ai-chatbot-ollama ollama pull gemma:2b
)

REM Install Qwen 2.5 3B - Excellent multilingual support (English/Arabic)
curl -s http://localhost:11434/api/tags | findstr "qwen2.5:3b" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ qwen2.5:3b is installed
) else (
    echo 📥 Installing qwen2.5:3b (3B) - Multilingual Excellence...
    docker exec ai-chatbot-ollama ollama pull qwen2.5:3b
)

REM Optional: Install Llama 3.2 3B for even better conversation quality
echo.
echo 🎯 Optional: Install Llama 3.2 3B for premium conversation quality?
echo    This model is larger (~2GB) but provides excellent chat responses.
set /p install_llama="Install Llama 3.2 3B? (y/n): "

if /i "%install_llama%"=="y" (
    curl -s http://localhost:11434/api/tags | findstr "llama3.2:3b" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ llama3.2:3b is already installed
    ) else (
        echo 📥 Installing llama3.2:3b (3B) - Premium Conversation Quality...
        docker exec ai-chatbot-ollama ollama pull llama3.2:3b
    )
)

echo.
echo 🎉 Application is ready!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:4000
echo 🤖 Ollama:   http://localhost:11434
echo.
echo 🤖 Available AI Models:
echo   • phi3:mini    - Fast ^& High Quality (3.8B)
echo   • gemma:2b     - Ultra Lightweight (2B)
echo   • qwen2.5:3b   - Multilingual Excellence (3B)
if /i "%install_llama%"=="y" (
    echo   • llama3.2:3b  - Premium Conversation (3B)
)
echo.
echo 📋 Useful commands:
echo   View logs: docker-compose logs -f
echo   Stop:      docker-compose down
echo   Restart:   docker-compose restart
echo.
pause