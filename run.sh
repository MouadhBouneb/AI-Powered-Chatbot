#!/bin/bash

echo "🚀 AI Chatbot - Quick Start"
echo "=========================="
echo ""

# Check if Docker is running
echo "🔍 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Download from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Start Docker services first
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama is ready"
        break
    fi
    sleep 2
done

# Check if required models are installed
echo "🤖 Installing optimal AI models for chatbot..."
MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

# Install Phi-3 Mini (3.8B) - Fast, good quality, perfect for chatbots
if echo "$MODELS" | grep -q "phi3:mini"; then
    echo "✅ phi3:mini is installed"
else
    echo "📥 Installing phi3:mini (3.8B) - Fast & High Quality..."
    docker exec ai-chatbot-ollama ollama pull phi3:mini
fi

# Install Gemma 2B - Very lightweight, great for quick responses
if echo "$MODELS" | grep -q "gemma:2b"; then
    echo "✅ gemma:2b is installed"
else
    echo "📥 Installing gemma:2b (2B) - Ultra Lightweight..."
    docker exec ai-chatbot-ollama ollama pull gemma:2b
fi

# Install Qwen 2.5 3B - Excellent multilingual support (English/Arabic)
if echo "$MODELS" | grep -q "qwen2.5:3b"; then
    echo "✅ qwen2.5:3b is installed"
else
    echo "📥 Installing qwen2.5:3b (3B) - Multilingual Excellence..."
    docker exec ai-chatbot-ollama ollama pull qwen2.5:3b
fi

# Optional: Install Llama 3.2 3B for even better conversation quality
echo ""
echo "🎯 Optional: Install Llama 3.2 3B for premium conversation quality?"
echo "   This model is larger (~2GB) but provides excellent chat responses."
read -p "Install Llama 3.2 3B? (y/n): " install_llama

if [[ $install_llama =~ ^[Yy]$ ]]; then
    if echo "$MODELS" | grep -q "llama3.2:3b"; then
        echo "✅ llama3.2:3b is already installed"
    else
        echo "📥 Installing llama3.2:3b (3B) - Premium Conversation Quality..."
        docker exec ai-chatbot-ollama ollama pull llama3.2:3b
    fi
fi

echo ""
echo "🎉 Application is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:4000"
echo "🤖 Ollama:   http://localhost:11434"
echo ""
echo "🤖 Available AI Models:"
echo "  • phi3:mini    - Fast & High Quality (3.8B)"
echo "  • gemma:2b     - Ultra Lightweight (2B)"
echo "  • qwen2.5:3b   - Multilingual Excellence (3B)"
if [[ $install_llama =~ ^[Yy]$ ]]; then
    echo "  • llama3.2:3b  - Premium Conversation (3B)"
fi
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop:      docker-compose down"
echo "  Restart:   docker-compose restart"
echo ""