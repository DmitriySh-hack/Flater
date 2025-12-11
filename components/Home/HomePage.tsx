import Middle_side from './MainSide/Middle_side'
import Search from './Serch'
import { useState } from 'react'

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
   
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div>
      <div className='search-container' style={{ paddingTop: '30px'}}>
        <Search
          onSearch={handleSearch}
          searchValue={searchQuery}
        />
      </div>
      <Middle_side searchQuery={searchQuery}/> 
    </div>
  )
}

export default HomePage