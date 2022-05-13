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
  };
  
const  showChallengeTab = () => {
    document.querySelector('#profile_tab').style.display = 'none';
    document.querySelector('#bracket_tab').style.display = 'block';
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
      document.getElementById('profile_tab').style.display = 'none';
      registerCustomTimeline()
    }
  };

  const init = (clientId, programId, leaderboardId) => {
    LiveLike.init({
        clientId: clientId,
      }).then(() => {
        //setupTheme();
        showProfileTabIfFirstTimeVisiting();
        //setupLeaderboard(leaderboardId);
        refreshProfileData();
        const widgetsContainer = document.querySelectorAll('livelike-widgets');
        widgetsContainer.forEach(container => {
            container.programid = programId;
        })
      });
};