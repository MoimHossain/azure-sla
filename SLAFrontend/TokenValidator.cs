

using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;


namespace SLAFrontend
{
    public class TokenValidator(
        IHttpClientFactory httpClientFactory,
        ILogger<TokenValidator> logger)
    {        
        private async Task<IEnumerable<SecurityKey>> GetSigningKeysAsync(string authority)
        {
            using var httpClient = httpClientFactory.CreateClient();

            var jwksUri = $"{authority}.well-known/jwks.json";
            var response = await httpClient.GetStringAsync(jwksUri);

            using var jsonDoc = JsonDocument.Parse(response);
            var keys = jsonDoc.RootElement.GetProperty("keys").EnumerateArray();

            var signingKeys = new List<SecurityKey>();

            foreach (var key in keys)
            {
                var kid = key.GetProperty("kid").GetString();
                var kty = key.GetProperty("kty").GetString();
                var use = key.GetProperty("use").GetString();
                var n = key.GetProperty("n").GetString();
                var e = key.GetProperty("e").GetString();

                if (kty == "RSA")
                {
                    var rsaParameters = new RSAParameters
                    {
                        Modulus = Base64UrlEncoder.DecodeBytes(n),
                        Exponent = Base64UrlEncoder.DecodeBytes(e)
                    };

                    var rsa = RSA.Create();
                    rsa.ImportParameters(rsaParameters);

                    signingKeys.Add(new RsaSecurityKey(rsa) { KeyId = kid });
                }                
            }
            return signingKeys;
        }

        public async Task<ClaimsPrincipal?> ValidateTokenAsync(
            string token, string authority, string audience)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = authority,
                ValidAudience = audience,
                IssuerSigningKeys = await GetSigningKeysAsync(authority)
            };

            try
            {
                var principal = tokenHandler.ValidateToken(
                    token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error validating token");
            }
            return null;
        }
    }
}





