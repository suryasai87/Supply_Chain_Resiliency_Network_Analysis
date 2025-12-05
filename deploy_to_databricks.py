#!/usr/bin/env python3
"""
Databricks Deployment Script for Supply Chain Resiliency AI Assist
Handles CLI setup, app.yaml management, and app deployment
Based on the /dbapps template pattern
"""

import os
import sys
import json
import subprocess
from typing import List, Tuple
from dataclasses import dataclass
import argparse
import fnmatch
import shutil
import time

@dataclass
class ScopeInfo:
    """Information about a Databricks scope"""
    name: str
    owner: str
    created_at: str
    secret_count: int

class DatabricksDeployer:
    def __init__(self, profile: str = None):
        self.workspace_url = None
        self.token = None
        self.user_email = None
        self.app_name = "supplychain-ai-assist"
        self.app_folder = None  # Will be auto-detected
        self.profile = profile  # Databricks CLI profile

        # Project structure (different from template)
        self.frontend_dir = "src/frontend"
        self.backend_dir = "src/backend"

        # Auto-detect workspace info
        self._auto_detect_workspace_info()

    def _add_profile(self, cmd: List[str]) -> List[str]:
        """Add profile flag to command if profile is set"""
        if self.profile:
            return cmd + ["--profile", self.profile]
        return cmd

    def _auto_detect_workspace_info(self):
        """Auto-detect workspace URL and user email from Databricks CLI"""
        try:
            # Get workspace URL from CLI config
            cmd = self._add_profile(["databricks", "config", "get", "host"])
            exit_code, stdout, stderr = self.run_command(cmd)
            if exit_code == 0 and stdout.strip():
                self.workspace_url = stdout.strip()

            # Get current user email
            cmd = self._add_profile(["databricks", "current-user", "me", "--output", "json"])
            exit_code, stdout, stderr = self.run_command(cmd)
            if exit_code == 0 and stdout.strip():
                try:
                    user_info = json.loads(stdout)
                    self.user_email = user_info.get("userName") or user_info.get("user_name")

                    # Set app_folder using detected user email
                    if self.user_email and not self.app_folder:
                        self.app_folder = f"/Workspace/Users/{self.user_email}/{self.app_name}"
                except json.JSONDecodeError:
                    pass

            # Fallback if app_folder not set
            if not self.app_folder:
                self.app_folder = f"/Workspace/Users/YOUR_USER@example.com/{self.app_name}"

        except Exception:
            # Silently fail and use defaults
            if not self.app_folder:
                self.app_folder = f"/Workspace/Users/YOUR_USER@example.com/{self.app_name}"

    def run_command(self, command: List[str], capture_output: bool = True) -> Tuple[int, str, str]:
        """Run a shell command and return exit code, stdout, stderr"""
        try:
            result = subprocess.run(
                command,
                capture_output=capture_output,
                text=True,
                check=False
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)

    def check_databricks_cli(self) -> bool:
        """Check if Databricks CLI is installed and configured"""
        print("🔍 Checking Databricks CLI...")

        # Check if databricks command exists
        exit_code, stdout, stderr = self.run_command(["databricks", "--version"])
        if exit_code != 0:
            print("❌ Databricks CLI not found. Please install it first:")
            print("   pip install databricks-cli")
            return False

        # Check if configured (with profile if specified)
        cmd = self._add_profile(["databricks", "workspace", "list", "/"])
        exit_code, stdout, stderr = self.run_command(cmd)
        if exit_code != 0:
            if self.profile:
                print(f"❌ Databricks CLI profile '{self.profile}' not configured. Please run:")
                print(f"   databricks auth login --host <workspace-url> --profile {self.profile}")
            else:
                print("❌ Databricks CLI not configured. Please run:")
                print("   databricks configure --token")
            return False

        profile_info = f" (profile: {self.profile})" if self.profile else ""
        print(f"✅ Databricks CLI is ready{profile_info}")
        print(f"   Workspace: {self.workspace_url}")
        return True

    def build_frontend(self) -> bool:
        """Build the React frontend"""
        print("🔨 Building React frontend...")

        # Change to frontend directory and run build (skip tsc type checking for deployment)
        exit_code, stdout, stderr = self.run_command([
            "bash", "-c", f"cd {self.frontend_dir} && npm install && npx vite build"
        ], capture_output=False)

        if exit_code != 0:
            print(f"❌ Frontend build failed")
            return False

        print("✅ Frontend built successfully")
        return True

    def copy_static_files(self) -> bool:
        """Copy built frontend to backend static directory"""
        print("📁 Copying static files...")

        static_dir = f"{self.backend_dir}/static"
        dist_dir = f"{self.frontend_dir}/dist"

        # Remove existing static directory
        if os.path.exists(static_dir):
            shutil.rmtree(static_dir)

        # Copy dist to static
        try:
            shutil.copytree(dist_dir, static_dir)
            print("✅ Static files copied successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to copy static files: {e}")
            return False

    def validate_app_yaml(self, app_yaml_path: str) -> bool:
        """Validate app.yaml configuration for consistency"""
        try:
            import yaml

            print("🔍 Validating app.yaml configuration...")

            with open(app_yaml_path, 'r') as f:
                config = yaml.safe_load(f)

            # Check for required fields
            if 'command' not in config:
                print("⚠️  No command specified in app.yaml")
                return False

            # Check for resource bindings (Genie spaces, endpoints)
            if 'resources' in config:
                print(f"✅ Found {len(config['resources'])} resource bindings")
                for res in config['resources']:
                    print(f"   - {res.get('name')}: {list(res.keys())[1] if len(res) > 1 else 'unknown'}")

            print("✅ app.yaml validation passed")
            return True

        except ImportError:
            print("⚠️  PyYAML not installed, skipping validation")
            print("   Install with: pip install pyyaml")
            return True
        except Exception as e:
            print(f"⚠️  Error validating app.yaml: {e}")
            return True  # Don't fail deployment on validation errors

    def package_backend(self) -> bool:
        """Package the backend for deployment"""
        print("📦 Packaging backend...")

        # Create build directory
        build_dir = "build/app"
        if os.path.exists("build"):
            shutil.rmtree("build")

        os.makedirs(build_dir)

        # Copy backend files (excluding unnecessary files)
        exclude_patterns = [
            "venv", "venv.*", ".venv", "env", ".env",  # Virtual environments
            "__pycache__", "*.pyc", "*.pyo", "*.pyd",  # Python cache
            ".pytest_cache", "test_*.py", "tests",     # Tests
            "test_*.log", "test_*.txt", "*.log",       # Logs
            "data.json", "cookies.txt",                # Data files
            ".env_template", "Makefile",               # Build files
            "build", "dist", "*.egg-info",             # Build artifacts
            "mlruns", "databricks_backup",             # ML/Backup files
            "*.backup", "*.dbd_secrets",               # Backup/secret files
            "node_modules", ".git", ".gitignore",      # Dev files
            ".DS_Store", "Thumbs.db",                  # OS files
        ]

        def should_exclude(item):
            """Check if item should be excluded based on patterns"""
            for pattern in exclude_patterns:
                if fnmatch.fnmatch(item, pattern):
                    return True
            return False

        for item in os.listdir(self.backend_dir):
            if not should_exclude(item) and not item.startswith('.'):
                src = os.path.join(self.backend_dir, item)
                dst = os.path.join(build_dir, item)
                if os.path.isdir(src):
                    shutil.copytree(src, dst)
                else:
                    shutil.copy2(src, dst)

        # Copy app.yaml from repository root
        app_yaml_src = os.path.join(os.getcwd(), "app.yaml")
        app_yaml_dst = os.path.join(build_dir, "app.yaml")

        if os.path.exists(app_yaml_src):
            shutil.copy2(app_yaml_src, app_yaml_dst)
            print("✅ Copied app.yaml from repository")

            # Validate the app.yaml configuration
            self.validate_app_yaml(app_yaml_dst)
        else:
            print("❌ app.yaml not found in repository root!")
            print("   Please create app.yaml with your Databricks Apps configuration")
            return False

        print("✅ Backend packaged successfully")
        return True

    def import_to_workspace(self) -> bool:
        """Import backend to Databricks workspace"""
        print("📤 Importing to Databricks workspace...")

        cmd = self._add_profile([
            "databricks", "workspace", "import-dir",
            "build/app", self.app_folder, "--overwrite"
        ])
        exit_code, stdout, stderr = self.run_command(cmd)

        if exit_code != 0:
            print(f"❌ Failed to import to workspace: {stderr}")
            return False

        print(f"✅ Imported to workspace: {self.app_folder}")
        return True

    def deploy_app(self) -> bool:
        """Deploy the app to Databricks"""
        print("🚀 Deploying app to Databricks...")

        # Create app if it doesn't exist
        cmd = self._add_profile([
            "databricks", "apps", "create", self.app_name,
            "--description", "Supply Chain Resiliency AI Assist - Network Analysis with Multi-Agent, Knowledge, and Genie Spaces"
        ])
        exit_code, stdout, stderr = self.run_command(cmd)

        # Allow deploy to proceed if error is 'already exists' or 'maximum number of apps'
        if exit_code != 0 and "already exists" not in stderr.lower() and "maximum number of apps" not in stderr.lower():
            print(f"⚠️  Note: {stderr}")

        # Deploy the app
        cmd = self._add_profile([
            "databricks", "apps", "deploy", self.app_name,
            "--source-code-path", self.app_folder
        ])
        exit_code, stdout, stderr = self.run_command(cmd)

        if exit_code != 0:
            print(f"❌ Failed to deploy app: {stderr}")
            return False

        print("✅ App deployed successfully!")
        return True

    def wait_for_app_deletion(self, app_name: str, timeout_seconds: int = 300) -> bool:
        """Wait for app deletion to complete"""
        print(f"⏳ Waiting for app deletion to complete...")

        start_time = time.time()

        while time.time() - start_time < timeout_seconds:
            # Check if app still exists
            cmd = self._add_profile(["databricks", "apps", "list"])
            exit_code, stdout, stderr = self.run_command(cmd)

            if exit_code != 0:
                print(f"❌ Error checking app list: {stderr}")
                return False

            # Check if our app is still in the list
            if app_name not in stdout:
                print(f"✅ App '{app_name}' has been successfully deleted")
                return True

            print(f"⏳ App '{app_name}' still being deleted... (elapsed: {int(time.time() - start_time)}s)")
            time.sleep(5)  # Wait 5 seconds before checking again

        print(f"❌ Timeout waiting for app deletion after {timeout_seconds} seconds")
        return False

    def delete_app(self, app_name: str) -> bool:
        """Delete an existing app"""
        print(f"🗑️  Deleting app: {app_name}")

        cmd = self._add_profile(["databricks", "apps", "delete", app_name])
        exit_code, stdout, stderr = self.run_command(cmd)

        if exit_code == 0:
            print(f"✅ Deleted app: {app_name}")
            return True
        else:
            print(f"❌ Failed to delete app: {stderr}")
            return False

    def hard_redeploy(self) -> bool:
        """Hard redeploy: delete existing app, wait for deletion, then redeploy"""
        print(f"🔥 Starting HARD REDEPLOY for app: {self.app_name}")
        print("=" * 60)

        # Step 1: Check if app exists and delete it
        print("🔍 Checking if app exists...")
        cmd = self._add_profile(["databricks", "apps", "list"])
        exit_code, stdout, stderr = self.run_command(cmd)

        if exit_code != 0:
            print(f"❌ Error checking app list: {stderr}")
            return False

        app_exists = self.app_name in stdout

        if app_exists:
            print(f"🗑️  App '{self.app_name}' exists. Deleting...")
            if not self.delete_app(self.app_name):
                print("❌ Failed to delete app. Aborting hard redeploy.")
                return False

            # Step 2: Wait for deletion to complete
            if not self.wait_for_app_deletion(self.app_name):
                print("❌ App deletion did not complete in time. Aborting hard redeploy.")
                return False
        else:
            print(f"ℹ️  App '{self.app_name}' does not exist. Proceeding with fresh deployment.")

        # Step 3: Build and package
        print("\n🔨 Building and packaging application...")
        if not self.build_frontend():
            return False
        if not self.copy_static_files():
            return False
        if not self.package_backend():
            return False
        if not self.import_to_workspace():
            return False

        # Step 4: Deploy the app
        print("\n🚀 Deploying fresh app...")
        if not self.deploy_app():
            return False

        # Step 5: Get app info
        self.get_app_info()

        print(f"\n🎉 HARD REDEPLOY completed successfully!")
        return True

    def get_app_info(self) -> bool:
        """Get app information and URL"""
        print("🔍 Getting app information...")

        cmd = self._add_profile(["databricks", "apps", "get", self.app_name, "--output", "json"])
        exit_code, stdout, stderr = self.run_command(cmd)

        if exit_code != 0:
            print(f"❌ Failed to get app info: {stderr}")
            return False

        try:
            app_info = json.loads(stdout)

            print(f"\n📱 App Information:")
            print(f"   Name: {app_info.get('name', 'N/A')}")
            print(f"   Status: {app_info.get('app_status', {}).get('state', 'N/A')}")
            print(f"   Created: {app_info.get('create_time', 'N/A')}")
            print(f"   Updated: {app_info.get('update_time', 'N/A')}")

            # Get the app URL from the response
            app_url = app_info.get('url', 'N/A')
            if app_url and app_url != 'N/A':
                print(f"\n🌐 App URL: {app_url}")
            else:
                print(f"\n🌐 App URL: (pending - check Databricks Apps UI)")

            # Show configured integrations
            print(f"\n🤖 AI Integrations:")
            print(f"   - Multi-Agent Supervisor: mas-0ad68bad-endpoint")
            print(f"   - Knowledge Assistant: ka-0445f231-endpoint")
            print(f"   - Genie Spaces: 5 configured")

            return True
        except json.JSONDecodeError:
            print(f"❌ Failed to parse app info: {stdout}")
            return False

    def cleanup(self):
        """Clean up temporary files"""
        print("🧹 Cleaning up...")

        # Remove build directory
        if os.path.exists("build"):
            shutil.rmtree("build")

        print("✅ Cleanup completed")

    def deploy(self, hard_redeploy: bool = False):
        """Main deployment workflow"""
        print(f"🚀 Starting Databricks deployment\n{'='*60}")
        print(f"📍 App Name: {self.app_name}")
        print(f"📍 Workspace Folder: {self.app_folder}")
        print("=" * 60)

        if not self.check_databricks_cli():
            self.cleanup()
            return False

        # If hard redeploy is requested
        if hard_redeploy:
            print("🔥 HARD REDEPLOY mode")
            success = self.hard_redeploy()
            self.cleanup()
            return success

        # Normal deployment
        if not self.build_frontend():
            self.cleanup()
            return False
        if not self.copy_static_files():
            self.cleanup()
            return False
        if not self.package_backend():
            self.cleanup()
            return False
        if not self.import_to_workspace():
            self.cleanup()
            return False
        if not self.deploy_app():
            self.cleanup()
            return False

        self.get_app_info()
        print("\n🎉 Deployment completed successfully!")
        self.cleanup()
        return True


def main():
    parser = argparse.ArgumentParser(description="Deploy Supply Chain Resiliency AI Assist to Databricks")
    parser.add_argument("--app-name", default="supplychain-ai-assist", help="App name")
    parser.add_argument("--app-folder", default=None, help="App folder in workspace (auto-detected if not provided)")
    parser.add_argument("--profile", default=None, help="Databricks CLI profile to use")
    parser.add_argument("--hard-redeploy", action="store_true", help="Hard redeploy: delete existing app, wait for deletion, then redeploy")

    args = parser.parse_args()

    deployer = DatabricksDeployer(profile=args.profile)
    deployer.app_name = args.app_name

    # Update app_folder if provided, otherwise use auto-detected path with new app_name
    if args.app_folder:
        deployer.app_folder = args.app_folder
    elif deployer.user_email:
        deployer.app_folder = f"/Workspace/Users/{deployer.user_email}/{args.app_name}"
    else:
        deployer.app_folder = f"/Workspace/Users/YOUR_USER@example.com/{args.app_name}"

    success = deployer.deploy(hard_redeploy=args.hard_redeploy)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
