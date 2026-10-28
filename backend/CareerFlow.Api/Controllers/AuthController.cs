using System.Security.Claims;
using CareerFlow.Api.DTOs;
using CareerFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, data) = await _authService.RegisterAsync(dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(data);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, data) = await _authService.LoginAsync(dto);
        if (!success)
        {
            return Unauthorized(new { message });
        }

        return Ok(data);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(user);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _authService.ForgotPasswordAsync(dto);
        return Ok(response);
    }
}
