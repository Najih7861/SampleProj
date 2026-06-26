"""JWT validation for the analytics service.

The token is minted by the .NET backend (Auth/JwtTokenService.cs) and forwarded
by the React client as a Bearer token. We verify it with the *same* secret,
issuer, audience, and algorithm, so a token good for the .NET API is good here.

Failure modes (per requirement):
  - missing / malformed / bad-signature / wrong issuer-audience  -> 401
  - expired                                                      -> 401
  - valid but not an Admin                                       -> 403
"""
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings

# auto_error=False so we can return our own 401 with a clear message when the
# Authorization header is missing entirely.
_bearer = HTTPBearer(auto_error=False)

# .NET writes the role under the full ClaimTypes.Role URI. We also accept the
# short "role"/"roles" forms in case the outbound claim map is ever changed.
_ROLE_URI = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """Validate the Bearer JWT and return its claims (with normalized roles)."""
    if creds is None or not creds.credentials:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            creds.credentials,
            settings.JWT_KEY,
            algorithms=[settings.JWT_ALG],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
            options={"require": ["exp"]},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    raw_roles = (
        payload.get(_ROLE_URI)
        or payload.get("role")
        or payload.get("roles")
        or []
    )
    payload["_roles"] = [raw_roles] if isinstance(raw_roles, str) else list(raw_roles)
    return payload


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Allow only tokens carrying the Admin role; otherwise 403."""
    if "Admin" not in user["_roles"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin role required")
    return user
