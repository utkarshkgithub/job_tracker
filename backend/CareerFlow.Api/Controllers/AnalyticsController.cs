using System.Security.Claims;
using CareerFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerFlow.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAnalytics([FromQuery] string? period = "30days")
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var data = await _analyticsService.GetAnalyticsDataAsync(userId, period);
        return Ok(data);
    }
}
