

export function rescale(number, minimumInputValue, maximumInputValue, minimumRescaledValue, maximumRescaledValue)
{
	return minimumRescaledValue + (number - minimumInputValue) * (maximumRescaledValue - minimumRescaledValue) / (maximumInputValue - minimumInputValue);
}




export function getDirectionRotatedQuarterRevolution(horizontal, vertical, isJoyConL)
{
    if(isJoyConL)
    {
        return {"horizontal": vertical, "vertical": -horizontal};
    }
    else {
        return {"horizontal": -vertical, "vertical": horizontal};
    }
}

export function getAngleFromCameraRotationY(angle)
{
    return angle % Math.PI / 2;
}



export function getAngleDifference(vec3A, vec3B)
{
    // https://stackoverflow.com/a/16544330
    const dot = (vec3A.x * vec3B.x) + (vec3A.y * vec3B.y) + (vec3A.z * vec3B.z);
    const lenSqA = (vec3A.x * vec3A.x) + (vec3A.y * vec3A.y) + (vec3A.z * vec3A.z);
    const lenSqB = (vec3B.x * vec3B.x) + (vec3B.y * vec3B.y) + (vec3B.z * vec3B.z);
    const angle = Math.acos(dot / Math.sqrt(lenSqA * lenSqB));
    return angle;
}



export function getAngleFromDirection(horizontal, vertical)
{
    return Math.atan2(vertical, horizontal);
}

export function getQuarterRevolutionAngleFromDirection(horizontal, vertical)
{
    return getAngleFromDirection(-vertical, horizontal);
}


export function getDirectionFromAngle(angle)
{
    // our angle have the range 0 to 2PI
    // but for this we need -PI to PI
    // so we just subtract PI from the angle
    return {horizontal: Math.cos(angle - Math.PI), vertical: Math.sin(angle - Math.PI)};
}