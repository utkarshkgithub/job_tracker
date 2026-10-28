using System.Security.Claims;
using CareerFlow.Api.DTOs;
using CareerFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerFlow.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InterviewsController : ControllerBase
{
    private readonly IInterviewService _interviewService;

    public InterviewsController(IInterviewService interviewService)
    {
        _interviewService = interviewService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetInterviews([FromQuery] string? filter = "upcoming")
    {
        var result = await _interviewService.GetInterviewsAsync(GetUserId(), filter);
        return Ok(result);
    }

    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendarInterviews([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _interviewService.GetInterviewsForCalendarAsync(GetUserId(), startDate, endDate);
        return Ok(result);
    }

    [HttpGet("by-application/{applicationId:int}")]
    public async Task<IActionResult> GetByApplication(int applicationId)
    {
        var result = await _interviewService.GetByApplicationIdAsync(GetUserId(), applicationId);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var interview = await _interviewService.GetByIdAsync(GetUserId(), id);
        if (interview == null)
        {
            return NotFound(new { message = "Interview not found or unauthorized." });
        }

        return Ok(interview);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInterviewDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, data, hasOverlapWarning) = await _interviewService.CreateAsync(GetUserId(), dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = data!.Id }, new
        {
            data,
            message,
            hasOverlapWarning
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInterviewDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, data) = await _interviewService.UpdateAsync(GetUserId(), id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { data, message });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _interviewService.DeleteAsync(GetUserId(), id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }
}
