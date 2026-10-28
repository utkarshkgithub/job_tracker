using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CareerFlow.Api.DTOs;
using CareerFlow.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace CareerFlow.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email.Trim().ToLowerInvariant());
        if (existingUser != null)
        {
            return (false, "An account with this email address already exists.", null);
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email.Trim().ToLowerInvariant(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            FullName = dto.FullName.Trim(),
            CreatedAt = DateTime.UtcNow,
            Theme = "system",
            DateFormat = "DD MMM YYYY",
            TimeFormat = "12-hour",
            TimeZoneId = "UTC"
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return (false, errors, null);
        }

        var token = GenerateJwtToken(user);
        var userDto = MapToUserDto(user);

        return (true, "Registration successful.", new AuthResponseDto
        {
            Token = token,
            User = userDto
        });
    }

    public async Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return (false, "Email or password is incorrect.", null);
        }

        var isValidPassword = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isValidPassword)
        {
            return (false, "Email or password is incorrect.", null);
        }

        var token = GenerateJwtToken(user);
        var userDto = MapToUserDto(user);

        return (true, "Login successful.", new AuthResponseDto
        {
            Token = token,
            User = userDto
        });
    }

    public async Task<UserDto?> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user == null ? null : MapToUserDto(user);
    }

    public async Task<(bool Success, string Message, UserDto? Data)> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found.", null);
        }

        user.FullName = dto.FullName.Trim();
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return (false, errors, null);
        }

        return (true, "Profile updated successfully.", MapToUserDto(user));
    }

    public async Task<(bool Success, string Message)> ChangePasswordAsync(string userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return (false, errors);
        }

        return (true, "Password changed successfully.");
    }

    public async Task<(bool Success, string Message, UserDto? Data)> UpdatePreferencesAsync(string userId, UpdatePreferencesDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found.", null);
        }

        user.Theme = dto.Theme;
        user.DateFormat = dto.DateFormat;
        user.TimeFormat = dto.TimeFormat;
        user.TimeZoneId = dto.TimeZoneId;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return (false, errors, null);
        }

        return (true, "Preferences updated successfully.", MapToUserDto(user));
    }

    public async Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim().ToLowerInvariant());
        if (user != null)
        {
            _logger.LogInformation("Password reset requested for {Email}", dto.Email);
            // In a production system, send email with reset token.
        }

        // Always return safe neutral message to prevent email enumeration
        return new MessageResponseDto
        {
            Success = true,
            Message = "If an account exists for that email, password reset instructions will be sent."
        };
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "CareerFlow_Super_Secret_Key_For_Jwt_Authentication_2026_Minimum_32_Chars";
        var issuer = _configuration["Jwt:Issuer"] ?? "CareerFlow";
        var audience = _configuration["Jwt:Audience"] ?? "CareerFlow";
        var expiryDays = double.TryParse(_configuration["Jwt:ExpiryDays"], out var days) ? days : 7;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim("fullName", user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToUserDto(ApplicationUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Theme = user.Theme,
            DateFormat = user.DateFormat,
            TimeFormat = user.TimeFormat,
            TimeZoneId = user.TimeZoneId,
            CreatedAt = user.CreatedAt
        };
    }
}
