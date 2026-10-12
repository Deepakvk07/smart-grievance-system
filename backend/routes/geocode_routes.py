import urllib.request
import urllib.parse
import json
from flask import Blueprint, request, jsonify

geocode_bp = Blueprint('geocode', __name__, url_prefix='/api/geocode')

def parse_osm_address(res18, res15=None):
    """
    Extract and structure granular civic address fields:
    Society/Complex, Road/Street, Colony/Sector, City, PIN Code, State.
    Uses multi-zoom OSM intelligence (zoom 18 for precision, zoom 15 for locality/enclave).
    """
    addr18 = res18.get('address', {}) if isinstance(res18, dict) else {}
    addr15 = res15.get('address', {}) if isinstance(res15, dict) else {}
    top_name = (res18.get('name') or '').strip()
    amenity_type = res18.get('type', '')

    # 1. Society / Apartment Complex / Landmark / Building / Enclave
    # Only true physical buildings or enclaves, NOT general residential area tags!
    building_keys = [
        'apartments', 'building', 'housing_estate', 'condominium',
        'house_name', 'amenity', 'office', 'shop', 'commercial', 'industrial',
        'leisure', 'retail', 'place_of_worship', 'school', 'hospital', 'college',
        'university', 'hotel'
    ]
    society = ''
    for k in building_keys:
        val = addr18.get(k)
        if val and isinstance(val, str) and val.strip():
            society = val.strip()
            break

    # If no physical building tag, check locality / vihar in zoom 15 (e.g. Atif Vihar)
    if not society:
        locality15 = addr15.get('locality')
        if locality15 and isinstance(locality15, str) and locality15.strip():
            society = locality15.strip()

    # If still not found and top_name is an amenity/building, use top_name
    if not society and top_name and amenity_type not in ['bench', 'waste_basket', 'post_box', 'street_lamp', 'residential', 'road', 'highway']:
        society = top_name

    # 2. Road / Street / Lane
    road = (
        addr18.get('road') or addr18.get('street') or addr18.get('highway') or
        addr18.get('pedestrian') or addr18.get('footway') or addr18.get('path') or
        addr15.get('road') or addr15.get('street') or ''
    ).strip()

    # If society is identical to road name, clear society so it doesn't duplicate
    if society.lower() == road.lower():
        society = ''

    # 3. Colony / Sector / Mohalla / Neighbourhood / Suburb / Residential Area
    colony_parts = []
    area_keys = [
        'neighbourhood', 'residential', 'suburb', 'quarter', 'allotments',
        'block', 'sector', 'mohalla', 'subdistrict', 'borough', 'ward', 'village', 'hamlet'
    ]
    for k in area_keys:
        v18 = addr18.get(k)
        if v18 and isinstance(v18, str) and v18.strip():
            clean_v = v18.strip()
            if clean_v not in colony_parts and clean_v.lower() != road.lower() and clean_v.lower() != society.lower():
                colony_parts.append(clean_v)
        v15 = addr15.get(k)
        if v15 and isinstance(v15, str) and v15.strip():
            clean_v = v15.strip()
            if clean_v not in colony_parts and clean_v.lower() != road.lower() and clean_v.lower() != society.lower():
                colony_parts.append(clean_v)

    colony = ', '.join(colony_parts[:2]) if colony_parts else ''

    # 4. City / District
    city_keys = ['city', 'town', 'municipality', 'county', 'state_district', 'city_district']
    city = ''
    for k in city_keys:
        val = addr18.get(k) or addr15.get(k)
        if val and isinstance(val, str) and val.strip():
            city = val.strip()
            break

    # 5. PIN Code
    pincode = (addr18.get('postcode') or addr15.get('postcode') or '').strip()

    # 6. State
    state = (addr18.get('state') or addr15.get('state') or '').strip()

    # 7. Suggestions list for quick-fill chips
    suggestions = []
    if society and society not in suggestions:
        suggestions.append(society)
    if road and road not in suggestions:
        suggestions.append(road)
    for c in colony_parts:
        if c not in suggestions:
            suggestions.append(c)
    if not road and colony:
        main_road_guess = f"{colony.split(',')[0]} Main Road"
        if main_road_guess not in suggestions:
            suggestions.append(main_road_guess)

    # Build clean, high-detail formatted address string
    components = []
    if society:
        components.append(society)
    if road and road not in components:
        components.append(road)
    if colony and colony not in components:
        components.append(colony)
    if city and city not in components:
        city_pin = f"{city} - {pincode}" if pincode else city
        components.append(city_pin)
    elif pincode:
        components.append(f"PIN {pincode}")
    if state and state not in components and city != state:
        components.append(state)

    formatted = ", ".join(components) if components else res18.get('display_name', 'Detected Location')

    return {
        'society': society,
        'road': road,
        'colony': colony,
        'city': city,
        'pincode': pincode,
        'state': state,
        'formatted_address': formatted,
        'has_exact_building': bool(society),
        'has_exact_road': bool(road),
        'suggestions': suggestions[:5]
    }

def build_accurate_address(address_dict, display_name):
    """Fallback helper wrapper"""
    parsed = parse_osm_address({'address': address_dict, 'display_name': display_name})
    return parsed['formatted_address']

@geocode_bp.route('/reverse', methods=['GET', 'POST'])
def reverse_geocode():
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        lat = data.get('lat') or data.get('latitude')
        lon = data.get('lon') or data.get('longitude')
    else:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
    if not lat or not lon:
        return jsonify({'success': False, 'message': 'Latitude and longitude are required'}), 400
        
    try:
        lat_f = float(lat)
        lon_f = float(lon)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid latitude or longitude'}), 400
        
    url18 = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat_f}&lon={lon_f}&zoom=18&addressdetails=1"
    url15 = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat_f}&lon={lon_f}&zoom=15&addressdetails=1"
    headers = {
        'User-Agent': 'SmartGrievanceSystem/1.0 (Municipal Public Redressal Portal; contact: support@smartgrievance.gov.in)',
        'Accept-Language': 'en,hi'
    }
    
    res18 = {}
    res15 = {}
    try:
        req18 = urllib.request.Request(url18, headers=headers)
        with urllib.request.urlopen(req18, timeout=5) as response:
            if response.status == 200:
                res18 = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Reverse geocode zoom 18 error: {e}")

    try:
        req15 = urllib.request.Request(url15, headers=headers)
        with urllib.request.urlopen(req15, timeout=4) as response:
            if response.status == 200:
                res15 = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Reverse geocode zoom 15 error: {e}")

    if res18 or res15:
        parsed = parse_osm_address(res18 or res15, res15)
        return jsonify({
            'success': True,
            'formatted_address': parsed['formatted_address'],
            'society': parsed['society'],
            'road': parsed['road'],
            'colony': parsed['colony'],
            'city': parsed['city'],
            'pincode': parsed['pincode'],
            'state': parsed['state'],
            'has_exact_building': parsed['has_exact_building'],
            'has_exact_road': parsed['has_exact_road'],
            'suggestions': parsed['suggestions'],
            'display_name': res18.get('display_name') or res15.get('display_name', ''),
            'latitude': lat_f,
            'longitude': lon_f
        }), 200
        
    # Fallback if external API times out: return formatted coordinates
    return jsonify({
        'success': True,
        'formatted_address': f"GPS Location ({lat_f:.6f}, {lon_f:.6f})",
        'society': '',
        'road': '',
        'colony': '',
        'city': '',
        'pincode': '',
        'state': '',
        'has_exact_building': False,
        'has_exact_road': False,
        'suggestions': [],
        'display_name': f"GPS Location ({lat_f:.6f}, {lon_f:.6f})",
        'latitude': lat_f,
        'longitude': lon_f,
        'fallback': True
    }), 200

@geocode_bp.route('/search', methods=['GET'])
def search_location():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'success': False, 'results': []}), 400
        
    encoded_q = urllib.parse.quote(query)
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={encoded_q}&addressdetails=1&limit=5"
    headers = {
        'User-Agent': 'SmartGrievanceSystem/1.0 (Municipal Public Redressal Portal)',
        'Accept-Language': 'en,hi'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=6) as response:
            if response.status == 200:
                results = json.loads(response.read().decode('utf-8'))
                formatted_results = []
                for item in results:
                    addr_dict = item.get('address', {})
                    display_name = item.get('display_name', '')
                    formatted = build_accurate_address(addr_dict, display_name)
                    formatted_results.append({
                        'formatted_address': formatted,
                        'display_name': display_name,
                        'lat': float(item.get('lat')),
                        'lon': float(item.get('lon')),
                        'address_details': addr_dict
                    })
                return jsonify({'success': True, 'results': formatted_results}), 200
    except Exception as e:
        print(f"Location search error: {e}")
        
    return jsonify({'success': False, 'results': []}), 200
