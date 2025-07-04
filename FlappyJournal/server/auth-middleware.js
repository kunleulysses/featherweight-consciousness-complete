import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8082';
const REALM = process.env.KEYCLOAK_REALM || 'featherweight';

const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 300000 // 5 minutes
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, getKey, {
    audience: 'featherweight-frontend',
    issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error('Token validation error:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      preferred_username: decoded.preferred_username,
      given_name: decoded.given_name,
      family_name: decoded.family_name,
      roles: decoded.realm_access?.roles || [],
      projectRoles: decoded.project_roles || {}
    };
    
    next();
  });
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, getKey, {
    audience: 'featherweight-frontend',
    issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        preferred_username: decoded.preferred_username,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        roles: decoded.realm_access?.roles || [],
        projectRoles: decoded.project_roles || {}
      };
    }
    next();
  });
}
