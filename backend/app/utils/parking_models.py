from pydantic import BaseModel, Field
from typing import List, Optional

"""
Used to define the data models for the parking data we fetch from
https://parken-in-ulm.de/get_parking_data. We are doing this to ensure
the data we receive from the API is in the expected format, since the
data from the API might change.
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
