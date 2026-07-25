// City/state lookup for Indian pincodes via the free India Post API.
// Returns null on any failure — callers treat the lookup as best-effort.
export async function lookupPincode(
  pincode: string
): Promise<{ city: string; state: string } | null> {
  if (!/^\d{6}$/.test(pincode)) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) return null;
    const data = await res.json();
    const po = data?.[0]?.PostOffice?.[0];
    if (!po) return null;
    return { city: po.District || po.Block || '', state: po.State || '' };
  } catch {
    return null;
  }
}
