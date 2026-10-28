using CareerFlow.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CareerFlow.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CareerFlowDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<CareerFlowDbContext>>();

        const int maxRetries = 10;
        var retryDelay = TimeSpan.FromSeconds(3);

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                logger.LogInformation("Attempting to connect and ensure database is created (attempt {Attempt}/{MaxRetries})...", attempt, maxRetries);
                await context.Database.EnsureCreatedAsync();
                logger.LogInformation("Database connection established and schema ensured.");
                break;
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                logger.LogWarning(ex, "SQL Server not ready yet (attempt {Attempt}/{MaxRetries}). Retrying in {Seconds}s...", attempt, maxRetries, retryDelay.TotalSeconds);
                await Task.Delay(retryDelay);
            }
        }

        try
        {
            // Seed demo user if not exists
            const string demoEmail = "demo@careerflow.dev";
            var demoUser = await userManager.FindByEmailAsync(demoEmail);

            if (demoUser == null)
            {
                logger.LogInformation("Seeding demo user and initial job applications...");
                demoUser = new ApplicationUser
                {
                    UserName = demoEmail,
                    Email = demoEmail,
                    FullName = "Alex Morgan",
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-60),
                    Theme = "system",
                    DateFormat = "DD MMM YYYY",
                    TimeFormat = "12-hour",
                    TimeZoneId = "UTC"
                };

                var createResult = await userManager.CreateAsync(demoUser, "CareerFlow@123");
                if (createResult.Succeeded)
                {
                    var now = DateTime.UtcNow;

                    var appStripe = new JobApplication
                    {
                        UserId = demoUser.Id,
                        CompanyName = "Stripe",
                        JobTitle = "Senior Backend Engineer",
                        JobPostingUrl = "https://stripe.com/jobs/senior-backend-engineer",
                        ApplicationDate = now.AddDays(-14).Date,
                        Status = ApplicationStatus.Interview,
                        Notes = "Referred by former colleague. Great engineering culture and focus on high availability.",
                        CreatedAt = now.AddDays(-14),
                        UpdatedAt = now.AddDays(-2)
                    };

                    var appGoogle = new JobApplication
                    {
                        UserId = demoUser.Id,
                        CompanyName = "Google",
                        JobTitle = "Staff Software Engineer",
                        JobPostingUrl = "https://careers.google.com/jobs/staff-swe",
                        ApplicationDate = now.AddDays(-20).Date,
                        Status = ApplicationStatus.Assessment,
                        Notes = "Completed online assessment on algorithms and concurrency. Awaiting recruiter follow-up.",
                        CreatedAt = now.AddDays(-20),
                        UpdatedAt = now.AddDays(-7)
                    };

                    var appMicrosoft = new JobApplication
                    {
                        UserId = demoUser.Id,
                        CompanyName = "Microsoft",
                        JobTitle = "Full Stack Developer",
                        JobPostingUrl = "https://careers.microsoft.com/us/en/job/fullstack",
                        ApplicationDate = now.AddDays(-5).Date,
                        Status = ApplicationStatus.Applied,
                        Notes = "Applied through company portal for Azure Developer Tools team.",
                        CreatedAt = now.AddDays(-5),
                        UpdatedAt = now.AddDays(-5)
                    };

                    var appNetflix = new JobApplication
                    {
                        UserId = demoUser.Id,
                        CompanyName = "Netflix",
                        JobTitle = "Senior Systems Engineer",
                        JobPostingUrl = "https://jobs.netflix.com/jobs/senior-systems",
                        ApplicationDate = now.AddDays(-35).Date,
                        Status = ApplicationStatus.Offer,
                        Notes = "Received formal written offer. Negotiating base compensation and start date.",
                        CreatedAt = now.AddDays(-35),
                        UpdatedAt = now.AddDays(-1)
                    };

                    var appAmazon = new JobApplication
                    {
                        UserId = demoUser.Id,
                        CompanyName = "Amazon Web Services",
                        JobTitle = "Software Development Engineer II",
                        JobPostingUrl = "https://amazon.jobs/en/jobs/sde2-aws",
                        ApplicationDate = now.AddDays(-18).Date,
                        Status = ApplicationStatus.Interview,
                        Notes = "Completed phone screen with hiring manager. Scheduled for virtual loop.",
                        CreatedAt = now.AddDays(-18),
                        UpdatedAt = now.AddDays(-3)
                    };

                    var appDatadog = new JobApplication
                    {
                        UserId = demoUser.Id,
                        CompanyName = "Datadog",
                        JobTitle = "Distributed Systems Engineer",
                        JobPostingUrl = "https://www.datadoghq.com/careers/detail/distributed-systems",
                        ApplicationDate = now.AddDays(-2).Date,
                        Status = ApplicationStatus.Applied,
                        Notes = "Applied via LinkedIn. Role focuses on telemetry ingestion pipelines in Go and C#.",
                        CreatedAt = now.AddDays(-2),
                        UpdatedAt = now.AddDays(-2)
                    };

                    var appMeta = new JobApplication
                    {
                        UserId = demoUser.Id,
                        CompanyName = "Meta",
                        JobTitle = "Production Engineer",
                        JobPostingUrl = "https://www.metacareers.com/jobs/production-engineer",
                        ApplicationDate = now.AddDays(-45).Date,
                        Status = ApplicationStatus.Rejected,
                        Notes = "Position closed due to organizational restructuring. Recruiter promised to stay in touch.",
                        CreatedAt = now.AddDays(-45),
                        UpdatedAt = now.AddDays(-25)
                    };

                    context.JobApplications.AddRange(appStripe, appGoogle, appMicrosoft, appNetflix, appAmazon, appDatadog, appMeta);
                    await context.SaveChangesAsync();

                    // Seed Interviews
                    var interviewStripe = new Interview
                    {
                        UserId = demoUser.Id,
                        JobApplicationId = appStripe.Id,
                        Round = "Technical Interview",
                        Type = "Video call",
                        ScheduledAt = now.AddDays(2).Date.AddHours(11), // 11:00 AM UTC in 2 days
                        MeetingUrl = "https://meet.google.com/abc-defg-hij",
                        Notes = "Deep dive into distributed transactions and rate limiting architectures.",
                        CreatedAt = now.AddDays(-2),
                        UpdatedAt = now.AddDays(-2)
                    };

                    var interviewAmazon = new Interview
                    {
                        UserId = demoUser.Id,
                        JobApplicationId = appAmazon.Id,
                        Round = "System Design",
                        Type = "Video call",
                        ScheduledAt = now.AddDays(5).Date.AddHours(14), // 2:00 PM UTC in 5 days
                        MeetingUrl = "https://chime.aws/1234567890",
                        Notes = "Review Amazon Leadership Principles: Customer Obsession & Ownership.",
                        CreatedAt = now.AddDays(-3),
                        UpdatedAt = now.AddDays(-3)
                    };

                    var interviewGooglePast = new Interview
                    {
                        UserId = demoUser.Id,
                        JobApplicationId = appGoogle.Id,
                        Round = "Recruiter Screening",
                        Type = "Phone call",
                        ScheduledAt = now.AddDays(-10).Date.AddHours(10),
                        MeetingUrl = null,
                        Notes = "Discussed resume highlights and timeline expectations.",
                        CreatedAt = now.AddDays(-12),
                        UpdatedAt = now.AddDays(-10)
                    };

                    var interviewNetflixOffer = new Interview
                    {
                        UserId = demoUser.Id,
                        JobApplicationId = appNetflix.Id,
                        Round = "Offer Review",
                        Type = "Video call",
                        ScheduledAt = now.AddDays(-3).Date.AddHours(15),
                        MeetingUrl = "https://zoom.us/j/9876543210",
                        Notes = "Compensation breakdown discussion with VP and talent director.",
                        CreatedAt = now.AddDays(-5),
                        UpdatedAt = now.AddDays(-3)
                    };

                    context.Interviews.AddRange(interviewStripe, interviewAmazon, interviewGooglePast, interviewNetflixOffer);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Demo data seeded successfully.");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }
    }
}
