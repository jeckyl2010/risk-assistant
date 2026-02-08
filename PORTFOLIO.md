# Portfolio System Storage

## Overview

Risk Assistant uses a **portfolio manifest** to track systems across multiple locations. This allows you to:

- Store systems in separate Git repositories
- Organize systems by team, project, or company
- Version control your risk assessments independently from the tool

## How It Works

### Portfolio Manifest

The `portfolio.yaml` file at the repository root lists all managed systems:

```yaml
systems:
  - name: "ProductionAPI"
    path: "./systems/ProductionAPI.yaml"
  
  - name: "DataPipeline"
    path: "C:\\Repos\\data-team\\systems\\DataPipeline.yaml"
  
  - name: "TeamSystem"
    path: "\\\\shared\\IT\\risk-systems\\TeamSystem.yaml"
```

### Creating Systems

When creating a new system in the UI:

1. **System ID**: Unique identifier (e.g., `shopfloor-analytics`)
2. **File Path** (optional):
   - **Relative**: `./systems/shopfloor-analytics.yaml` (default)
   - **Absolute**: `C:\Repos\my-systems\shopfloor-analytics.yaml`
   - **UNC**: `\\shared\IT\systems\shopfloor-analytics.yaml`

If you omit the path, it defaults to `./systems/{SystemID}.yaml`.

### Workflow Example

**Scenario**: You want systems stored in a separate Git repository for version control.

1. Create a new Git repo for your systems:
   ```powershell
   mkdir C:\Repos\companyA-systems
   cd C:\Repos\companyA-systems
   git init
   ```

2. In Risk Assistant, create a new system:
   - System ID: `ProductionAPI`
   - File Path: `C:\Repos\companyA-systems\ProductionAPI.yaml`

3. The system is saved to your separate repo:
   ```
   C:\Repos\companyA-systems\
   └── ProductionAPI.yaml
   ```

4. Track it with Git in that repository:
   ```powershell
   cd C:\Repos\companyA-systems
   git add ProductionAPI.yaml
   git commit -m "Add Production API risk assessment"
   git push
   ```

5. Your `portfolio.yaml` in Risk Assistant now references it:
   ```yaml
   systems:
     - name: "ProductionAPI"
       path: "C:\\Repos\\companyA-systems\\ProductionAPI.yaml"
   ```

### Multi-Repository Setup

You can manage systems across multiple repositories:

```
C:\Repos\
├── risk-assistant\           # Tool installation
│   └── portfolio.yaml        # Central registry
│
├── backend-systems\          # Team A's systems (Git repo)
│   ├── ProductionAPI.yaml
│   └── PaymentService.yaml
│
├── data-systems\             # Team B's systems (Git repo)
│   ├── DataWarehouse.yaml
│   └── ETLPipeline.yaml
│
└── iot-systems\              # Team C's systems (Git repo)
    └── Shopfloor.yaml
```

Each team manages their own Git repository and commits/pushes independently. Risk Assistant reads all systems from the paths listed in `portfolio.yaml`.

## Benefits

✅ **Independent Version Control**: Each system or portfolio tracked separately  
✅ **Team Autonomy**: Different teams can own their system files  
✅ **Flexible Storage**: Local, network shares, or cloud-synced folders  
✅ **Simple Collaboration**: Standard Git workflows (pull, commit, push)  
✅ **No Database**: Plain YAML files, human-readable and diff-friendly

## Migration from Old Structure

If you have existing systems in `./systems/`, they're already referenced in the initial `portfolio.yaml`. No action needed.

To move a system to a new location:

1. Manually move the YAML file to the new location
2. Update the `path` in `portfolio.yaml`
3. Save and reload Risk Assistant

## Technical Details

- **Portfolio File**: `portfolio.yaml` at repository root
- **Path Resolution**: Absolute paths used as-is, relative paths resolved from repo root
- **System Operations**: Create, Read, Update, Delete all maintain portfolio manifest
- **No Directory Scanning**: Only systems listed in portfolio are loaded

