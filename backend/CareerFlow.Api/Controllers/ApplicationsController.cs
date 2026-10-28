using System.Security.Claims;
using CareerFlow.Api.DTOs;
using CareerFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerFlow.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IJobApplicationService _applicationService;

    public ApplicationsController(IJobApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetApplications([FromQuery] ApplicationFilterDto filter)
    {
        var result = await _applicationService.GetApplicationsAsync(GetUserId(), filter);
        return Ok(result);
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup()
    {
        var result = await _applicationService.GetLookupListAsync(GetUserId());
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var app = await _applicationService.GetByIdAsync(GetUserId(), id);
        if (app == null)
        {
            return NotFound(new { message = "Application not found or unauthorized." });
        }

        return Ok(app);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobApplicationDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, data, isDuplicateWarning) = await _applicationService.CreateAsync(GetUserId(), dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = data!.Id }, new
        {
            data,
            message,
            isDuplicateWarning
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobApplicationDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, data) = await _applicationService.UpdateAsync(GetUserId(), id, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { data, message });
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, message, data) = await _applicationService.UpdateStatusAsync(GetUserId(), id, dto.Status);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { data, message });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _applicationService.DeleteAsync(GetUserId(), id);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }
}
