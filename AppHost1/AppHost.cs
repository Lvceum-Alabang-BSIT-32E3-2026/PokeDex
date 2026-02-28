var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.IdentityServerApi>("identityserverapi");

builder.AddProject<Projects.ResourceApi>("resourceapi");

builder.Build().Run();
