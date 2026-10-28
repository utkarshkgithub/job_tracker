using CareerFlow.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CareerFlow.Api.Data;

public class CareerFlowDbContext : IdentityDbContext<ApplicationUser>
{
    public CareerFlowDbContext(DbContextOptions<CareerFlowDbContext> options)
        : base(options)
    {
    }

    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<Interview> Interviews => Set<Interview>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(a => a.Id);

            entity.Property(a => a.CompanyName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(a => a.JobTitle)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(a => a.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.HasOne(a => a.User)
                .WithMany(u => u.JobApplications)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => a.UserId);
            entity.HasIndex(a => new { a.UserId, a.Status });
            entity.HasIndex(a => new { a.UserId, a.ApplicationDate });
        });

        builder.Entity<Interview>(entity =>
        {
            entity.HasKey(i => i.Id);

            entity.Property(i => i.Round)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(i => i.Type)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasOne(i => i.JobApplication)
                .WithMany(a => a.Interviews)
                .HasForeignKey(i => i.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.User)
                .WithMany(u => u.Interviews)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(i => i.UserId);
            entity.HasIndex(i => i.JobApplicationId);
            entity.HasIndex(i => new { i.UserId, i.ScheduledAt });
        });
    }
}
