using System.ComponentModel.DataAnnotations;

namespace CareerFlow.Api.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Theme { get; set; } = "system";
    public string DateFormat { get; set; } = "DD MMM YYYY";
    public string TimeFormat { get; set; } = "12-hour";
    public string TimeZoneId { get; set; } = "UTC";
    public DateTime CreatedAt { get; set; }
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")]
    public string FullName { get; set; } = string.Empty;
}

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Current password is required.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required.")]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters.")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please confirm your new password.")]
    [Compare("NewPassword", ErrorMessage = "New password and confirmation do not match.")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}

public class UpdatePreferencesDto
{
    [Required]
    [RegularExpression("^(light|dark|system)$", ErrorMessage = "Theme must be light, dark, or system.")]
    public string Theme { get; set; } = "system";

    [Required]
    public string DateFormat { get; set; } = "DD MMM YYYY";

    [Required]
    [RegularExpression("^(12-hour|24-hour)$", ErrorMessage = "Time format must be 12-hour or 24-hour.")]
    public string TimeFormat { get; set; } = "12-hour";

    [Required]
    public string TimeZoneId { get; set; } = "UTC";
}

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    public string Email { get; set; } = string.Empty;
}

public class MessageResponseDto
{
    public string Message { get; set; } = string.Empty;
    public bool Success { get; set; } = true;
}
