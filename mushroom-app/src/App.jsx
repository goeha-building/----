import { useState, useEffect } from 'react'
import axios from 'axios'
import { Heart, Search } from 'lucide-react'
import './App.css'

function App() {
  const [mushroom, setMushroom] = useState(null); // 현재 보여지는 버섯
  const [loading, setLoading] = useState(false);  // 로딩 상태
  const [wishlist, setWishlist] = useState([]);   // 찜 목록

  // API 키 가져오기 (.env 파일)
  const API_KEY = import.meta.env.VITE_API_KEY;

  // 앱 시작 시 로컬스토리지에서 찜 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('mushroomWishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
    // 처음에 버섯 하나 뽑기
    fetchRandomMushroom();
  }, []);

  // 버섯 랜덤 뽑기 함수 (수정된 버전)
  // src/App.jsx 안의 fetchRandomMushroom 함수 교체

  // src/App.jsx 의 fetchRandomMushroom 함수 교체

  // src/App.jsx 의 fetchRandomMushroom 함수 교체

  // src/App.jsx 의 fetchRandomMushroom 함수 교체

  const fetchRandomMushroom = async () => {
    setLoading(true);
    setMushroom(null);

    try {
      // ==========================================================
      // 1단계: 랜덤한 목록 가져오기 (번호표 뽑기)
      // ==========================================================
      const randomPage = Math.floor(Math.random() * 300) + 1; 

      const listResponse = await axios.get('/api/1400119/FungiService/fngsPilbkSearch', {
        params: {
          serviceKey: API_KEY, 
          st: '1', sw: '', numOfRows: '1',
          pageNo: randomPage,
          _type: 'json' 
        }
      });

      // 데이터 꺼내기
      const listBody = listResponse.data.response.body;
      if (!listBody.items) {
         setMushroom(null); return;
      }
      const listItem = Array.isArray(listBody.items.item) ? listBody.items.item[0] : listBody.items.item;
      
      // ★ 중요: 여기서 버섯의 고유 번호(ID)를 확보합니다.
      const mushroomId = listItem.fngsPilbkNo; 
      
      console.log(`1단계 성공! 버섯 이름: ${listItem.fngsGnrlNm}, 번호: ${mushroomId}`);


      // ==========================================================
      // 2단계: 확보한 번호로 상세정보(사진) 가져오기
      // ==========================================================
      const detailResponse = await axios.get('/api/1400119/FungiService/fngsPilbkInfo', {
        params: {
          serviceKey: API_KEY,
          q1: mushroomId, // 여기에 아까 구한 번호를 넣습니다!
          _type: 'json'
        }
      });

      // 상세 데이터 꺼내기
      const detailBody = detailResponse.data.response.body;
      let detailItem = null;

      if (detailBody.items && detailBody.items.item) {
        detailItem = Array.isArray(detailBody.items.item) ? detailBody.items.item[0] : detailBody.items.item;
      }

      console.log("2단계 상세정보:", detailItem);

      // ==========================================================
      // 3단계: 1단계와 2단계 정보 합치기
      // ==========================================================
      
      // 이미지 주소가 없으면 빈칸
      const imageUrl = detailItem?.imgUrl || '';

      const newMushroom = {
        id: mushroomId,
        // 이름 (1단계 데이터 사용)
        name: listItem.fngsGnrlNm || '이름 없음', 
        // 학명 (1단계 데이터 사용)
        latinName: listItem.fngsScnm || '',     
        // 과명 (1단계 데이터 사용)
        family: listItem.familyKorNm || listItem.familyNm || '정보 없음', 
        
        // 이미지 (2단계 데이터 사용 - 없으면 대체 이미지)
        imgUrl: imageUrl && imageUrl !== '' ? imageUrl : 'https://placehold.co/600x400?text=No+Photo+Available',
        
        // 설명 (2단계 데이터 사용 - 없으면 기본 문구)
        desc: detailItem?.fngsMcrspcfeatCn || detailItem?.fngsGnrfeatCn || '상세 설명이 등록되지 않은 버섯입니다.' 
      };

      setMushroom(newMushroom);

    } catch (error) {
      console.error("에러 발생:", error);
      alert("버섯 정보를 가져오는데 실패했어요. (콘솔 확인 필요)");
    } finally {
      setLoading(false);
    }
  };

  // 찜하기/취소하기 기능
  const toggleLike = () => {
    if (!mushroom) return;

    // 이미 있는지 확인
    const isLiked = wishlist.some(item => item.name === mushroom.name);
    let newWishlist;

    if (isLiked) {
      newWishlist = wishlist.filter(item => item.name !== mushroom.name);
    } else {
      newWishlist = [...wishlist, mushroom];
    }

    setWishlist(newWishlist);
    localStorage.setItem('mushroomWishlist', JSON.stringify(newWishlist));
  };

  // 찜 목록 클릭 시 해당 버섯 보기
  const selectFromWishlist = (item) => {
    setMushroom(item);
  };

  return (
    <div className="wrapper">
      <h1>🍄 오늘의 버섯 도감 🍄</h1>
      
      <div className="container">
        {/* 왼쪽: 메인 버섯 화면 */}
        <div className="main-section">
          {loading ? (
            <div className="loading">버섯을 숲에서 찾아오는 중... 🏃‍♂️</div>
          ) : mushroom ? (
            <div className="card">
              <img src={mushroom.imgUrl} alt={mushroom.name} className="mushroom-img" />
              <h2>{mushroom.name}</h2>
              <p><i>{mushroom.latinName}</i></p>
              <p><strong>과명:</strong> {mushroom.family}</p>
              <p>{mushroom.desc}</p>
              
              <div className="btn-group">
                <button className="btn-random" onClick={fetchRandomMushroom}>
                  <Search size={18} /> 다른 버섯 찾기
                </button>
                <button className="btn-like" onClick={toggleLike}>
                  <Heart size={18} fill={wishlist.some(w => w.name === mushroom.name) ? "white" : "none"} />
                  {wishlist.some(w => w.name === mushroom.name) ? "찜 취소" : "찜하기"}
                </button>
              </div>
            </div>
          ) : (
            <div className="loading">
              <p>버섯을 찾지 못했어요. (빈 페이지 당첨)</p>
              <button className="btn-random" onClick={fetchRandomMushroom}>다시 찾기</button>
            </div>
          )}
        </div>

        {/* 오른쪽: 찜 목록 */}
        <div className="wishlist-section">
          <h3>💖 내 버섯 창고 ({wishlist.length})</h3>
          {wishlist.length === 0 ? (
            <p>아직 찜한 버섯이 없어요.</p>
          ) : (
            wishlist.map((item, index) => (
              <div key={index} className="wish-item" onClick={() => selectFromWishlist(item)}>
                <img src={item.imgUrl} alt={item.name} className="wish-img-thumb" />
                <div>
                  <strong>{item.name}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App