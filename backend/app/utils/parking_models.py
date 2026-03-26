from pydantic import BaseModel, Field
from typing import List, Optional

"""
Used to define the data models for the parking data we fetch from
https://parken-in-ulm.de/get_parking_data. 
"""

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
    jsonrpc: str = "2.0"
    id: Optional[int] = None
    result: ParkingDataResult


class ParkingLotStatus(BaseModel):
    id: int
    name: str
    total_spaces: int
    lat: Optional[float] = None
    lon: Optional[float] = None
    current_occupancy: int
    vacant_spaces: int
    occupancy_pct: float
    forecast_occupancy: Optional[int] = None
    fetched_at: Optional[str] = None
