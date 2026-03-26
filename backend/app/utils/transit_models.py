from typing import Optional

from pydantic import BaseModel


class SWUPositionData(BaseModel):
    Longitude: float
    Latitude: float
    Bearing: int


class SWUTimeData(BaseModel):
    Deviation: int
    ReferenceTime: str


class SWUJourneyData(BaseModel):
    RouteNumber: Optional[int] = None
    ArrivalDirectionText: Optional[str] = None
    DepartureDirectionText: Optional[str] = None
    Direction: Optional[int] = None


class SWUTripEntry(BaseModel):
    VehicleNumber: int
    VehicleCategory: int
    IsActive: bool
    PositionData: Optional[SWUPositionData] = None
    TimeData: Optional[SWUTimeData] = None
    JourneyData: Optional[SWUJourneyData] = None


class SWUVehicleTrip(BaseModel):
    TripData: list[SWUTripEntry]


class SWUVehicleTripResponse(BaseModel):
    VehicleTrip: SWUVehicleTrip


class BusPosition(BaseModel):
    vehicleNumber: int
    lat: float
    lon: float
    bearing: int
    routeNumber: int
    direction: str
    deviation: int
    category: int  # 1=tram, 5=bus
