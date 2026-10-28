using CareerFlow.Api.DTOs;

namespace CareerFlow.Api.Services;

public interface IAuthService
{
    Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterAsync(RegisterDto dto);
    Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginDto dto);
    Task<UserDto?> GetCurrentUserAsync(string userId);
    Task<(bool Success, string Message, UserDto? Data)> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    Task<(bool Success, string Message)> ChangePasswordAsync(string userId, ChangePasswordDto dto);
    Task<(bool Success, string Message, UserDto? Data)> UpdatePreferencesAsync(string userId, UpdatePreferencesDto dto);
    Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto);
}
