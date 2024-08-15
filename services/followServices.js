const Follow = require('../models/follow')

const followUserIds = async (identityUserId) => {
    try {
        // Obtener los usuarios a los que sigue el usuario identificado
        let following = await Follow.find({ 'user': identityUserId }).select({ "_id": 0, "__v": 0, user: 0 });
        console.log('Following:', following);

        // Obtener los seguidores del usuario identificado
        let followers = await Follow.find({ 'followed': identityUserId }).select({ "_id": 0, "__v": 0, followed: 0 });
        console.log('Followers:', followers);

        // Procesar array de identificadores
        let followingClean = following.map(follow => follow.followed);
        let followersClean = followers.map(follow => follow.user);

        return {
            following: followingClean,
            followers: followersClean
        };
    } catch (error) {
        // Manejar errores
        console.error(error);
        return {
            following: [],
            followers: []
        };
    }
};



const followThisUser = async (identityUserId, profileUserId) => {
    try {
        // Obtener el seguimiento del usuario identificado al perfil
        let following = await Follow.find({ 'user': identityUserId, 'followed': profileUserId })

        // Obtener el seguimiento del perfil al usuario identificado
        let follower = await Follow.find({ 'user': profileUserId, 'followed': identityUserId })

        // Procesar array de identificadores otra manera
        let followingClean = following.map(follow => follow.followed);
        let followersClean = follower.map(follow => follow.user);

        return {
            following: followingClean,
            follower: followersClean
        };
    } catch (error) {
        console.error(error);
        return {
            following: [],
            followers: []
        };
    }
};

module.exports = {
    followUserIds,
    followThisUser
}