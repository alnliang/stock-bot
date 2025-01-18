import requests
import time
import json
from datetime import datetime

# Define API endpoints
TOKEN_PROFILES_URL = "https://api.dexscreener.com/token-profiles/latest/v1"
TOKEN_DETAILS_URL = "https://api.dexscreener.com/latest/dex/tokens/{}"

seen_addresses = set()

def convert_timestamp_to_relative_time(timestamp_ms):
    timestamp = timestamp_ms / 1000  # Convert to seconds
    created_time = datetime.fromtimestamp(timestamp)
    now = datetime.now()
    delta = now - created_time

    if delta.total_seconds() < 60:
        return f"{int(delta.total_seconds())} sec"
    elif delta.total_seconds() < 3600:
        return f"{int(delta.total_seconds() // 60)} min"
    else:
        return f"{int(delta.total_seconds() // 3600)} hr"

def fetch_new_pairs():
    try:
        response = requests.get(TOKEN_PROFILES_URL)
        response.raise_for_status()
        data = response.json()

        new_pairs = []
        for token in data:  # Assuming the response is a list
            token_address = token.get("tokenAddress")
            if token_address and token_address not in seen_addresses:
                seen_addresses.add(token_address)
                new_pairs.append(token_address)
        return new_pairs

    except requests.RequestException as e:
        print(f"Error fetching token profiles: {e}")
        return []

def fetch_token_details(token_address):
    try:
        url = TOKEN_DETAILS_URL.format(token_address)
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # Assuming the structure includes a 'pairs' list
        pairs = data.get("pairs", [])
        if pairs:
            pair = pairs[0]  # Take the first pair if multiple exist
            return {
                "symbol": pair["baseToken"]["symbol"],
                "marketCap": pair.get("marketCap", "N/A"),
                "liquidity": pair.get("liquidity", {}).get("usd", "N/A"),
                "created_at": convert_timestamp_to_relative_time(pair.get("pairCreatedAt", 0)),
                "is_boosted": "Yes" if pair.get("boosts", {}).get("active", 0) > 0 else "No"
            }
        else:
            return None

    except requests.RequestException as e:
        print(f"Error fetching token details for {token_address}: {e}")
        return None

def fetch_new_api_data():
    try:
        # Make your API call here
        response = requests.get("YOUR_NEW_API_ENDPOINT")
        data = response.json()
        
        # Process the data as needed
        processed_data = process_api_data(data)
        
        # Write to a new JSON file
        with open('newApiData.json', 'w') as f:
            json.dump(processed_data, f, indent=4)
            
    except requests.RequestException as e:
        print(f"Error fetching new API data: {e}")

def main():
    print("Starting data tracker...")
    while True:
        print("Checking for new data...")
        fetch_new_pairs()  # Existing function
        fetch_new_api_data()  # New function
        
        print("Waiting for 15 seconds...")
        time.sleep(15)

if __name__ == "__main__":
    main()
