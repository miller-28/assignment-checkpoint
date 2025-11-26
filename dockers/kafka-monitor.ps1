# Kafka Monitoring Script
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('topics', 'messages', 'latest', 'groups', 'all')]
    [string]$Action = 'all'
)

$container = "assignment-kafka"

function Show-Topics {
    Write-Host "`n=== Kafka Topics ===" -ForegroundColor Cyan
    docker exec $container kafka-topics --bootstrap-server localhost:9092 --list
}

function Show-TopicDetails {
    Write-Host "`n=== Topic Details ===" -ForegroundColor Cyan
    docker exec $container kafka-topics --bootstrap-server localhost:9092 --describe
}

function Show-Messages {
    param([int]$Count = 20)
    Write-Host "`n=== Last $Count Messages ===" -ForegroundColor Cyan
    docker exec $container kafka-console-consumer `
        --bootstrap-server localhost:9092 `
        --topic order-events `
        --from-beginning `
        --max-messages $Count `
        --timeout-ms 3000 2>$null | ForEach-Object {
            try {
                $event = $_ | ConvertFrom-Json
                [PSCustomObject]@{
                    EventType = $event.event_type
                    OrderId = $event.data.order_id.Substring(0,8) + "..."
                    Status = $event.data.status
                    Timestamp = $event.timestamp
                }
            } catch {
                $_
            }
        } | Format-Table -AutoSize
}

function Show-LatestMessages {
    Write-Host "`n=== Latest Messages (tail) ===" -ForegroundColor Cyan
    docker exec $container kafka-console-consumer `
        --bootstrap-server localhost:9092 `
        --topic order-events `
        --partition 0 `
        --offset latest `
        --max-messages 5 `
        --timeout-ms 2000 2>$null
}

function Show-ConsumerGroups {
    Write-Host "`n=== Consumer Groups ===" -ForegroundColor Cyan
    docker exec $container kafka-consumer-groups --bootstrap-server localhost:9092 --list
    
    Write-Host "`n=== Consumer Group Details ===" -ForegroundColor Cyan
    $groups = docker exec $container kafka-consumer-groups --bootstrap-server localhost:9092 --list
    foreach ($group in $groups) {
        if ($group -and $group -ne "") {
            Write-Host "`nGroup: $group" -ForegroundColor Yellow
            docker exec $container kafka-consumer-groups `
                --bootstrap-server localhost:9092 `
                --group $group `
                --describe 2>$null
        }
    }
}

switch ($Action) {
    'topics' { 
        Show-Topics
        Show-TopicDetails
    }
    'messages' { Show-Messages -Count 50 }
    'latest' { Show-LatestMessages }
    'groups' { Show-ConsumerGroups }
    'all' {
        Show-Topics
        Show-TopicDetails
        Show-Messages
        Show-ConsumerGroups
    }
}

Write-Host "`n=== Quick Commands ===" -ForegroundColor Green
Write-Host "View topics:        .\kafka-monitor.ps1 -Action topics"
Write-Host "View messages:      .\kafka-monitor.ps1 -Action messages"
Write-Host "View latest:        .\kafka-monitor.ps1 -Action latest"
Write-Host "View consumer groups: .\kafka-monitor.ps1 -Action groups"
Write-Host "View all:           .\kafka-monitor.ps1 -Action all"
Write-Host ""
