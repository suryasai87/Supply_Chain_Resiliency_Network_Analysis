#!/usr/bin/env python3
"""
Build script for Supply Chain Resiliency Network Analysis
Builds frontend and packages for Databricks deployment
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path


def run_command(command: str, cwd: str = None) -> bool:
    """Run a shell command and return success status"""
    print(f"  Running: {command}")
    result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Error: {result.stderr}")
        return False
    if result.stdout:
        print(f"  {result.stdout}")
    return True


def main():
    print("=" * 60)
    print("Building Supply Chain Resiliency Network Analysis")
    print("=" * 60)

    project_root = Path(__file__).parent
    frontend_dir = project_root / "src" / "frontend"
    backend_dir = project_root / "src" / "backend"
    build_dir = project_root / "build"
    app_dir = build_dir / "app"

    # Clean and create build directory
    print("\n[1/5] Cleaning build directory...")
    if build_dir.exists():
        shutil.rmtree(build_dir)
    app_dir.mkdir(parents=True)
    print("  Done")

    # Install and build frontend
    print("\n[2/5] Building React frontend...")
    if not run_command("npm install", cwd=str(frontend_dir)):
        print("  Failed to install frontend dependencies")
        sys.exit(1)

    if not run_command("npm run build", cwd=str(frontend_dir)):
        print("  Failed to build frontend")
        sys.exit(1)
    print("  Frontend built successfully")

    # Copy backend files
    print("\n[3/5] Copying backend files...")
    shutil.copy2(backend_dir / "app.py", app_dir / "app.py")
    shutil.copy2(backend_dir / "requirements.txt", app_dir / "requirements.txt")

    # Copy routers
    routers_dest = app_dir / "routers"
    routers_dest.mkdir(exist_ok=True)
    for router_file in (backend_dir / "routers").glob("*.py"):
        shutil.copy2(router_file, routers_dest / router_file.name)

    # Copy services
    services_dest = app_dir / "services"
    services_dest.mkdir(exist_ok=True)
    for service_file in (backend_dir / "services").glob("*.py"):
        shutil.copy2(service_file, services_dest / service_file.name)

    print("  Backend files copied")

    # Copy frontend build to static
    print("\n[4/5] Copying frontend build to static directory...")
    static_dir = app_dir / "static"
    frontend_dist = frontend_dir / "dist"

    if frontend_dist.exists():
        shutil.copytree(frontend_dist, static_dir)
        print("  Static files copied")
    else:
        print("  Warning: Frontend dist not found, creating empty static dir")
        static_dir.mkdir(exist_ok=True)

    # Copy app.yaml from repository root
    print("\n[5/5] Copying app.yaml...")
    app_yaml_src = project_root / "app.yaml"
    app_yaml_dst = app_dir / "app.yaml"

    if app_yaml_src.exists():
        shutil.copy2(app_yaml_src, app_yaml_dst)
        print(f"  Copied app.yaml from repository root")
    else:
        print("  ERROR: app.yaml not found in repository root!")
        print("  Please create app.yaml with your Databricks Apps configuration")
        sys.exit(1)

    # Print summary
    print("\n" + "=" * 60)
    print("Build Summary")
    print("=" * 60)
    print(f"  Build directory: {build_dir}")
    print(f"  App directory: {app_dir}")
    print(f"  Static files: {static_dir}")
    print(f"  app.yaml: {app_dir / 'app.yaml'}")

    # Count files
    file_count = sum(1 for _ in app_dir.rglob("*") if _.is_file())
    print(f"  Total files: {file_count}")

    print("\n  Build completed successfully!")
    print("\n  Next step: Run 'python deploy.py dev' to deploy to Databricks")
    print("=" * 60)


if __name__ == "__main__":
    main()
