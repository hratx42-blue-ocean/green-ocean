import React from 'react';
import { shallow, mount, render } from 'enzyme';
import ProfilePage from '../Components/ProfilePage.jsx';

describe('Profile component --->', () => {
  test('should render without throwing an error', async () => {
    expect(await shallow(<ProfilePage loading={false} />));
  });

  test('should be selectable by class "ProfilePage"', async () => {
    expect(
      await shallow(<ProfilePage loading={false} />).is('.profilePage')
    ).toBe(true);
  });

  test('should mount in a full DOM', async () => {
    const wrapper = await mount(
      <ProfilePage
        loading={false}
        accountData={{
          email: 'test@example.com',
          firstName: 'testFirstName',
          lastName: 'testLastName'
        }}
      />
    );
    console.log(wrapper);
    expect(wrapper.find('.profilePage').length).toBe(3);
  });
});

// describe('Profile edit buttons should toggle input fields', function() {
//   test('first name', async function() {
//     const wrapper = mount(<ProfilePage />).at(0);
//     const simulate = wrapper.find('edit').first().simulate('click');
//     expect(await wrapper.find('edit').props().firstNameIsHidden.toEqual(true));
//   });
//
