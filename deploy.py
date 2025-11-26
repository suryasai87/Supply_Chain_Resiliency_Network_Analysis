#!/usr/bin/env python3
"""
Automated Databricks Asset Bundle Deployment Script
Handles complete deployment pipeline from build to app deployment
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from typing import Tuple


class DatabricksDeployer:
    def __init__(self, app_name: str, target: str = "dev", profile: str = None):
        self.app_name = app_name
        self.target = target
        self.profile = profile or os.getenv("DATABRICKS_CONFIG_PROFILE", "DEFAULT")
        self.workspace_path = None
        self.app_path = None
        self.user_email = None

    def run_command(self, command: list, check: bool = True) -> Tuple[int, str, str]:
        """Run a command and return exit code, stdout, stderr"""
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=check
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.CalledProcessError as e:
            return e.returncode, e.stdout, e.stderr

    def print_section(self, title: str):
        """Print a formatted section header"""
        print()
        print("=" * 70)
        print(f" {title}")
        print("=" * 70)

    def step1_build_application(self):
        """Step 1: Build the application"""
        self.print_section("Step 1: Building application")
        exit_code, stdout, stderr = self.run_command(["python3", "build.py"])
        if exit_code != 0:
            print(f"  Build failed: {stderr}")
            sys.exit(1)
        print("  Application built successfully")

    def step2_validate_bundle(self):
        """Step 2: Validate bundle configuration"""
        self.print_section("Step 2: Validating bundle configuration")
        cmd = ["databricks", "bundle", "validate", "-t", self.target]
        if self.profile:
            cmd.extend(["--profile", self.profile])

        exit_code, stdout, stderr = self.run_command(cmd, check=False)
        if exit_code != 0:
            print(f"  Validation warning: {stderr}")
            print("  Continuing anyway...")
        else:
            print("  Bundle validation successful")

    def step3_get_workspace_paths(self):
        """Step 3: Get workspace paths"""
        self.print_section("Step 3: Determining workspace paths")

        # Get current user email
        cmd = ["databricks", "current-user", "me", "--output", "json"]
        if self.profile:
            cmd.extend(["--profile", self.profile])

        exit_code, stdout, stderr = self.run_command(cmd)
        if exit_code != 0:
            print(f"  Failed to get user info: {stderr}")
            sys.exit(1)

        user_info = json.loads(stdout)
        self.user_email = user_info.get("userName", user_info.get("user_name"))

        # Set workspace paths
        self.workspace_path = f"/Workspace/Users/{self.user_email}/.bundle/{self.app_name}/{self.target}"
        self.app_path = f"{self.workspace_path}/app"

        print(f"  User: {self.user_email}")
        print(f"  Workspace path: {self.workspace_path}")
        print(f"  App path: {self.app_path}")

    def step4_upload_app(self):
        """Step 4: Upload built app to workspace"""
        self.print_section("Step 4: Uploading built app to workspace")

        cmd = [
            "databricks", "workspace", "import-dir",
            "build/app", self.app_path,
            "--overwrite"
        ]
        if self.profile:
            cmd.extend(["--profile", self.profile])

        exit_code, stdout, stderr = self.run_command(cmd)
        if exit_code != 0:
            print(f"  Upload failed: {stderr}")
            sys.exit(1)
        print("  App uploaded to workspace")

    def step5_deploy_app(self):
        """Step 5: Deploy the app"""
        self.print_section("Step 5: Deploying app to Databricks Apps")

        # First try to create the app
        cmd = [
            "databricks", "apps", "create", self.app_name,
            "--description", "Supply Chain Resiliency Network Analysis"
        ]
        if self.profile:
            cmd.extend(["--profile", self.profile])

        exit_code, stdout, stderr = self.run_command(cmd, check=False)
        if exit_code != 0 and "already exists" not in stderr.lower():
            print(f"  Note: {stderr}")

        # Deploy the app
        cmd = [
            "databricks", "apps", "deploy", self.app_name,
            "--source-code-path", self.app_path
        ]
        if self.profile:
            cmd.extend(["--profile", self.profile])

        exit_code, stdout, stderr = self.run_command(cmd)
        if exit_code != 0:
            print(f"  Deployment failed: {stderr}")
            sys.exit(1)

        # Parse deployment info
        try:
            deployment_info = json.loads(stdout)
            print(f"  Deployment ID: {deployment_info.get('deployment_id', 'N/A')}")
            status = deployment_info.get('status', {})
            print(f"  Status: {status.get('state', 'N/A')}")
        except json.JSONDecodeError:
            print(f"  {stdout}")
        print("  App deployed successfully")

    def step6_get_app_info(self):
        """Step 6: Get and display app information"""
        self.print_section("Step 6: Getting app information")

        cmd = ["databricks", "apps", "get", self.app_name, "--output", "json"]
        if self.profile:
            cmd.extend(["--profile", self.profile])

        exit_code, stdout, stderr = self.run_command(cmd)
        if exit_code != 0:
            print(f"  Failed to get app info: {stderr}")
            return None

        app_info = json.loads(stdout)
        app_url = app_info.get("url", "N/A")

        self.print_section("Deployment Complete!")
        print(f"  App Name: {self.app_name}")
        print(f"  Environment: {self.target}")
        print(f"  URL: {app_url}")
        print()
        print("  Integrations:")
        print("    - Multi-Agent Supervisor: supply-chain-analysis-mas")
        print("    - Knowledge Assistant: supplytics-knowledge-assistant")
        print("    - Genie Spaces: 5 configured spaces")
        print("=" * 70)

        return app_url

    def deploy(self):
        """Run the complete deployment pipeline"""
        print(f"\nDeploying {self.app_name} to Databricks ({self.target} environment)")

        try:
            self.step1_build_application()
            self.step2_validate_bundle()
            self.step3_get_workspace_paths()
            self.step4_upload_app()
            self.step5_deploy_app()
            app_url = self.step6_get_app_info()

            if app_url:
                print(f"\n  App is live at: {app_url}")

        except KeyboardInterrupt:
            print("\n\n  Deployment interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"\n  Deployment failed: {e}")
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Deploy Supply Chain Resiliency App")
    parser.add_argument(
        "target",
        nargs="?",
        default="dev",
        choices=["dev", "staging", "prod"],
        help="Deployment target (default: dev)"
    )
    parser.add_argument(
        "--profile",
        default=None,
        help="Databricks CLI profile to use"
    )
    parser.add_argument(
        "--app-name",
        default="supply-chain-resiliency",
        help="Application name"
    )

    args = parser.parse_args()

    deployer = DatabricksDeployer(
        app_name=args.app_name,
        target=args.target,
        profile=args.profile
    )

    deployer.deploy()


if __name__ == "__main__":
    main()
