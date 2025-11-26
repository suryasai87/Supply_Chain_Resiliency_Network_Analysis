"""Authentication router with Databricks SSO support"""

import os
from fastapi import APIRouter, Request
import jwt

router = APIRouter()


def extract_user_from_headers(request: Request) -> dict:
    """Extract user information from Databricks SSO headers"""

    # OBO (On-Behalf-Of) authorization
    email = request.headers.get("x-forwarded-email")
    if email:
        return {
            "authenticated": True,
            "email": email,
            "name": email.split("@")[0],
            "source": "obo"
        }

    # U2M OAuth via access token
    access_token = request.headers.get("x-forwarded-access-token")
    if access_token:
        try:
            # Decode JWT without verification (Databricks handles validation)
            payload = jwt.decode(access_token, options={"verify_signature": False})
            return {
                "authenticated": True,
                "email": payload.get("email") or payload.get("sub"),
                "name": payload.get("name") or payload.get("preferred_username"),
                "source": "u2m_oauth"
            }
        except jwt.DecodeError:
            pass

    # Check environment for local development
    if not os.getenv("DATABRICKS_RUNTIME_VERSION"):
        return {
            "authenticated": True,
            "email": "dev@localhost",
            "name": "Developer",
            "source": "local_dev"
        }

    return {
        "authenticated": False,
        "email": None,
        "name": None,
        "source": None
    }


@router.get("/status")
async def auth_status(request: Request):
    """Get current authentication status"""
    return extract_user_from_headers(request)


@router.get("/user/profile")
async def user_profile(request: Request):
    """Get detailed user profile"""
    user_info = extract_user_from_headers(request)

    if not user_info["authenticated"]:
        return {"error": "Not authenticated"}

    return {
        **user_info,
        "workspace": os.getenv("DATABRICKS_SERVER_HOSTNAME", "unknown"),
        "permissions": ["read", "write", "analyze"]
    }
