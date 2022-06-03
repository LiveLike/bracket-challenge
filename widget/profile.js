

const updateUserProfile = ({ fullName, email, nickname }) => {
  LiveLike.updateUserProfile({
    accessToken: LiveLike.userProfile.access_token,
    options: {
      nickname: nickname,
      custom_data: JSON.stringify({
        fullName: fullName,
        email: email,
      }),
    },
  })
    .then((res) => {
      localStorage.setItem('ProfileIsValid', true);
      refreshProfileData();
      showChallengeTab()
      registerCustomTimeline()
    })
    .catch((err) => {
      console.warn(err);
    });
};

const refreshProfileData = () => {
  //document.querySelector('#profile-tab-label').innerHTML = `Profile`;
  document.querySelector('#form-user-nickName').value =
    LiveLike.userProfile.nickname;
  var customData = JSON.parse(LiveLike.userProfile.custom_data);
  if (customData) {
    if (customData.fullName) {
      document.querySelector('#form-user-fullName').value = customData.fullName;
    }
    if (customData.email) {
      document.querySelector('#form-user-email').value = customData.email;
    }
  }
  performUserFormValidation();
};

const handleCreateUserProfile = (e) => {
  if (profileIsValid()) {
    updateUserProfile({
      fullName: document.querySelector('#form-user-fullName').value,
      email: document.querySelector('#form-user-email').value,
      nickname: document.querySelector('#form-user-nickName').value,
    });
  }
};

const showProfileTab = () => {
  document.querySelector('#profile_tab').style.display = 'block';
  document.querySelector('#bracket_tab').style.display = 'none';
  document.querySelector('#leaderboard_tab').style.display = 'none';
};

const showChallengeTab = () => {
  document.querySelector('#profile_tab').style.display = 'none';
  document.querySelector('#bracket_tab').style.display = 'block';
  document.querySelector('#leaderboard_tab').style.display = 'none';
}

const profileIsValid = () => {
  const value = localStorage.getItem('ProfileIsValid');
  if (value) {
    return true;
  }

  const fullName = document.querySelector('#form-user-fullName').value;
  const nickname = document.querySelector('#form-user-nickName').value;
  const email = document.querySelector('#form-user-email').value;

  if (fullName && email && nickname) {
    return true;
  }

  return false;
};

const performUserFormValidation = () => {
  if (profileIsValid()) {
    document.querySelector('#createProfileButton').removeAttribute('disabled');
  } else {
    document
      .querySelector('#createProfileButton')
      .setAttribute('disabled', 'disabled');
  }
};

const showProfileTabIfFirstTimeVisiting = () => {
  performUserFormValidation();
  if (!profileIsValid()) {
    showProfileTab();
  } else {
    showChallengeTab()
    registerCustomTimeline()
  }
};

const init = (clientId, programId, leaderboardId) => {
  LiveLike.init({
    clientId: clientId,
  }).then(() => {
    //setupTheme();
    showProfileTabIfFirstTimeVisiting();
    setupLeaderboard(leaderboardId)
    refreshProfileData();
    const widgetsContainer = document.querySelectorAll('livelike-widgets');
    widgetsContainer.forEach(container => {
      container.programid = programId;
    })
  });
};

const setupLeaderboard = (leaderboardId => {

  const buildLeaderboard = (leaderboardId) => {
    LiveLike.getLeaderboardEntries({
      leaderboardId,
    }).then((lb) => {
      const lbContainer = document.querySelector(
        '.leaderboard-entries-container'
      );

      // If leaderboard items already exist, remove them to re-build on leaderboard update
      lbContainer.children.length > 0 &&
        Array.from(lbContainer.children).forEach((el) => el.remove());

      // Get current profile results
      const currentProfileEntry = lb.entries.find(
        (x) => x.profile_id == LiveLike.userProfile.id
      );
      if (currentProfileEntry) {
        if (currentProfileEntry.rank >= 10) {
          lb.entries.unshift(currentProfileEntry);
        }
      } else {
        lb.entries.unshift({
          profile_id: LiveLike.userProfile.id,
          rank: '',
          score: 0,
        });
      }

      // Loop through leaderboard entries to create list items for each entry
      //lb.entries = lb.entries.slice(0, 10);
      lb.entries.forEach((entry) => {
        const entryRow = document.createElement('tr');
        entryRow.setAttribute('class', 'list-item');
        if (entry.profile_id === LiveLike.userProfile.id) {
          entry.profile_nickname = 'Moi';
          entryRow.setAttribute('class', 'list-item current-profile-list-item');
        }
        entryRow.innerHTML = `
<td class="rank">${entry.rank}</td>
<td class="name">${entry.profile_nickname}</td>
<td class="pts">${entry.score}</td>
          `;
        lbContainer.appendChild(entryRow);
      });
    });
  };


  document.getElementsByClassName('alert-link')[0].onclick = function(){
    updateLeaderboardData()
  }

  

  document.getElementById('leaderboard_close').onclick = function(){
    showChallengeTab()
  }

  document.getElementById('alert_close').onclick = function(){
    document.getElementById("validation_error").classList.remove('show')
  }
  
  
  const updateLeaderboardData = () => {
    document.getElementById('bracket_tab').style.display = 'none'
    document.getElementById('leaderboard_tab').style.display = 'block'
    buildLeaderboard(leaderboardId);
    //buildProfileRank(leaderboardId);
  };
  
  captureScreenShotAndShare = ()=> {
    html2canvas(document.querySelector("#bracket_tab"),{foreignObjectRendering: true,logging: true, letterRendering: 1, allowTaint : true }).then(canvas => {
      let url = canvas.toDataURL('image/png') // finally produced image url
      
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'fileName.png', { type: blob.type });

      if (navigator.share) {
         navigator.share({
           title: 'Title to be shared',
           text: 'Text to be shared',
           url: [file],
         })
     } else {
        let shareButton = document.querySelector("#share")
        shareButton.setAttribute("data-url",url)
        shareButton.click()
     }
   });
  }

});