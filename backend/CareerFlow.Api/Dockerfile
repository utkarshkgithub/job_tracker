# Multi-stage build for CareerFlow ASP.NET Core Web API
# Stage 1: Build and publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY CareerFlow.Api.csproj ./
RUN dotnet restore CareerFlow.Api.csproj

# Copy remaining source code and publish release artifacts
COPY . ./
RUN dotnet publish CareerFlow.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

ENTRYPOINT ["dotnet", "CareerFlow.Api.dll"]
