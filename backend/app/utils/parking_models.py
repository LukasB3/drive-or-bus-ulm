from pydantic import BaseModel, Field
from typing import List, Optional


class ParkingFacility(BaseModel):
    id: int
    name: str
    total_parking_spaces: int
    vacant_parking_spaces: int
    last_update: str

    @property
    def current_occupancy(self) -> int:
        return self.total_parking_spaces - self.vacant_parking_spaces


class ParkingDataResult(BaseModel):
    facilities: List[ParkingFacility]


class ParkingDataResponse(BaseModel):
    """JSON-RPC 2.0 wrapper from parken-in-ulm.de"""
    jsonrpc: str = "2.0"
    id: Optional[int] = None
    result: ParkingDataResult
