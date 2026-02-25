"""
Conflict resolution and sync queue management.
Handles offline-first data synchronization.
"""
from datetime import datetime
from typing import List, Dict, Optional
import json

class SyncQueue:
    def __init__(self):
        self.queue = []
    
    def add_operation(self, operation_type: str, data: dict, device_id: str):
        """Add operation to queue with timestamp."""
        self.queue.append({
            "id": f"{device_id}_{datetime.utcnow().timestamp()}",
            "type": operation_type,
            "data": data,
            "device_id": device_id,
            "timestamp": datetime.utcnow().isoformat(),
            "retry_count": 0
        })
    
    def resolve_conflict(self, local_op: dict, server_op: dict) -> dict:
        """
        Last-write-wins with device priority.
        Technician device wins over admin edits in field.
        """
        local_time = datetime.fromisoformat(local_op["timestamp"])
        server_time = datetime.fromisoformat(server_op["timestamp"])
        
        # If local is newer, keep local
        if local_time > server_time:
            return local_op
        
        # If server is newer but local is field device, warn
        if local_op["device_id"].startswith("TECH"):
            return {
                "resolution": "manual_review",
                "local": local_op,
                "server": server_op
            }
        
        return server_op
    
    def process_queue(self) -> List[Dict]:
        """Process pending operations, handle failures."""
        results = []
        
        for op in self.queue:
            try:
                result = self.execute_operation(op)
                results.append({"id": op["id"], "status": "success"})
            except Exception as e:
                op["retry_count"] += 1
                if op["retry_count"] > 3:
                    results.append({
                        "id": op["id"], 
                        "status": "failed",
                        "error": str(e)
                    })
                else:
                    # Keep in queue for retry
                    pass
        
        return results
    
    def execute_operation(self, operation: dict):
        """Execute single operation against database."""
        # Implementation: route to appropriate handler
        pass
