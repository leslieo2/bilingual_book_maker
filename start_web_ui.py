#!/usr/bin/env python3
"""
Startup script for Bilingual Book Maker Web UI
Starts both the Flask API server and React development server
"""

import os
import sys
import time
import signal
import subprocess
import threading
from pathlib import Path

# Configuration
API_PORT = 8002
REACT_PORT = 3000
PROJECT_ROOT = Path(__file__).parent
WEB_UI_DIR = PROJECT_ROOT / "web-ui"
API_SERVER_SCRIPT = PROJECT_ROOT / "api_server.py"

# Global process references
api_process = None
react_process = None

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python dependencies
    missing_deps = []
    required_python_deps = ['flask', 'flask_cors', 'requests']
    
    for dep in required_python_deps:
        try:
            __import__(dep)
        except ImportError:
            missing_deps.append(dep)
    
    if missing_deps:
        print(f"❌ Missing Python dependencies: {', '.join(missing_deps)}")
        print("📦 Installing missing dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install"] + missing_deps, check=True)
        print("✅ Python dependencies installed")
    else:
        print("✅ Python dependencies are satisfied")
    
    # Check if Node.js is available
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js found: {result.stdout.strip()}")
        else:
            raise subprocess.CalledProcessError(result.returncode, 'node')
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/")
        return False
    
    # Check if web-ui directory exists
    if not WEB_UI_DIR.exists():
        print(f"❌ Web UI directory not found: {WEB_UI_DIR}")
        return False
    
    # Check if package.json exists
    package_json = WEB_UI_DIR / "package.json"
    if not package_json.exists():
        print(f"❌ package.json not found: {package_json}")
        return False
    
    print("✅ All dependencies check passed")
    return True

def install_npm_dependencies():
    """Install npm dependencies if node_modules doesn't exist"""
    node_modules = WEB_UI_DIR / "node_modules"
    
    if not node_modules.exists():
        print("📦 Installing npm dependencies...")
        try:
            subprocess.run(['npm', 'install'], cwd=WEB_UI_DIR, check=True)
            print("✅ npm dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install npm dependencies: {e}")
            return False
    else:
        print("✅ npm dependencies already installed")
    
    return True

def start_api_server():
    """Start the Flask API server"""
    global api_process
    
    print(f"🚀 Starting API server on port {API_PORT}...")
    
    try:
        # Set environment variables
        env = os.environ.copy()
        env['PYTHONPATH'] = str(PROJECT_ROOT)
        
        api_process = subprocess.Popen(
            [sys.executable, str(API_SERVER_SCRIPT)],
            cwd=PROJECT_ROOT,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Monitor API server output in a separate thread
        def monitor_api():
            for line in api_process.stdout:
                print(f"[API] {line.strip()}")
        
        api_thread = threading.Thread(target=monitor_api, daemon=True)
        api_thread.start()
        
        # Wait a moment for the server to start
        time.sleep(2)
        
        if api_process.poll() is None:
            print(f"✅ API server started successfully on http://localhost:{API_PORT}")
            return True
        else:
            print("❌ API server failed to start")
            return False
            
    except Exception as e:
        print(f"❌ Failed to start API server: {e}")
        return False

def start_react_server():
    """Start the React development server"""
    global react_process
    
    print(f"🚀 Starting React development server on port {REACT_PORT}...")
    
    try:
        # Set environment variables
        env = os.environ.copy()
        env['REACT_APP_API_BASE_URL'] = f'http://localhost:{API_PORT}'
        env['PORT'] = str(REACT_PORT)
        env['BROWSER'] = 'none'  # Don't auto-open browser
        
        react_process = subprocess.Popen(
            ['npm', 'start'],
            cwd=WEB_UI_DIR,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Monitor React server output in a separate thread
        def monitor_react():
            for line in react_process.stdout:
                line = line.strip()
                if line:
                    print(f"[React] {line}")
        
        react_thread = threading.Thread(target=monitor_react, daemon=True)
        react_thread.start()
        
        # Wait for React server to start
        print("⏳ Waiting for React server to start...")
        time.sleep(10)
        
        if react_process.poll() is None:
            print(f"✅ React server started successfully on http://localhost:{REACT_PORT}")
            return True
        else:
            print("❌ React server failed to start")
            return False
            
    except Exception as e:
        print(f"❌ Failed to start React server: {e}")
        return False

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("\n🛑 Shutting down servers...")
    
    if api_process:
        print("🔪 Stopping API server...")
        api_process.terminate()
        try:
            api_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            api_process.kill()
    
    if react_process:
        print("🔪 Stopping React server...")
        react_process.terminate()
        try:
            react_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            react_process.kill()
    
    print("👋 Goodbye!")
    sys.exit(0)

def open_browser():
    """Open browser to the React app"""
    import webbrowser
    time.sleep(3)  # Wait a bit more for everything to be ready
    url = f"http://localhost:{REACT_PORT}"
    print(f"🌐 Opening browser to {url}")
    webbrowser.open(url)

def main():
    """Main startup function"""
    print("🎯 Bilingual Book Maker Web UI Startup")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Dependency check failed")
        return 1
    
    # Install npm dependencies
    if not install_npm_dependencies():
        print("❌ Failed to install npm dependencies")
        return 1
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start API server
        if not start_api_server():
            print("❌ Failed to start API server")
            return 1
        
        # Start React server
        if not start_react_server():
            print("❌ Failed to start React server")
            return 1
        
        # Open browser in a separate thread
        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()
        
        print("\n" + "=" * 50)
        print("🎉 Bilingual Book Maker Web UI is ready!")
        print("=" * 50)
        print(f"📖 Web Interface: http://localhost:{REACT_PORT}")
        print(f"🔧 API Server:    http://localhost:{API_PORT}")
        print("=" * 50)
        print("Press Ctrl+C to stop all servers")
        print("=" * 50)
        
        # Keep the main process alive
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if api_process and api_process.poll() is not None:
                print("❌ API server stopped unexpectedly")
                break
                
            if react_process and react_process.poll() is not None:
                print("❌ React server stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        signal_handler(signal.SIGTERM, None)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())