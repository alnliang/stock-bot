import { useState } from 'react';
import { StockData, TimeSeriesData } from '@/types/StockTypes';
import './StockTable.css';

interface StockTableProps {
  title: string;
  data: StockData[];
  onSearch: (query: string) => void;
  searchResults: TimeSeriesData[] | null;
  isSearching: boolean;
  onBack: () => void;
}

const StockTable = ({ title, data = [], onSearch, searchResults, isSearching, onBack }: StockTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery(''); // Clear input after search
    }
  };
  const rowHeight = 40; // px per data row
  const headerHeight = 50; // px
  const maxBodyHeight = `${5 * rowHeight + headerHeight +10}px`;

  return (
    <div className="stock-table">
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a stock..."
              className="search-input"
            />
            <button type="submit" className="search-button">search</button>
            {isSearching && (
              <button type="button" onClick={onBack} className="back-button">back</button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container" style={{ overflow: 'auto' , maxHeight: maxBodyHeight}}>
        <table>
          <thead>
            <tr>
              {isSearching ? (
                <>
                  <th>Time</th>
                  <th>Open</th>
                  <th>Close</th>
                  <th>High</th>
                  <th>Low</th>
                  <th>Volume</th>
                  <th>Change %</th>
                </>
              ) : (
                <>
                  <th>Ticker</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>Change %</th>
                  <th>Volume</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isSearching && searchResults ? (
              searchResults.length > 0 ? (
                searchResults.map((stock, index) => {
                  const timeParts = stock.time.split(" ");
                  const time = timeParts.length > 1 ? timeParts[1] : stock.time;
                  const change = Number(stock["4. close"]) - Number(stock["1. open"]);
                  const changePercent = (change / Number(stock["1. open"])) * 100;
                  return (
                    <tr key={index} className={changePercent >= 0 ? "positive" : "negative"}>
                      <td>{time}</td>
                      <td>${Number(stock["1. open"]).toFixed(2)}</td>
                      <td>${Number(stock["4. close"]).toFixed(2)}</td>
                      <td>${Number(stock["2. high"]).toFixed(2)}</td>
                      <td>${Number(stock["3. low"]).toFixed(2)}</td>
                      <td>{stock["5. volume"]}</td>
                      <td>{changePercent.toFixed(2)}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7}>No search results found</td></tr>
              )
            ) : (
              data.map((stock) => (
                <tr key={stock.ticker} className={Number(stock.change_amount) >= 0 ? "positive" : "negative"}>
                  <td>{stock.ticker}</td>
                  <td>${stock.price}</td>
                  <td>${stock.change_amount}</td>
                  <td>{stock.change_percentage}</td>
                  <td>{stock.volume}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;
