const Follow = require('../models/follow')

const followUserIds = async (identityUserId) => {
    try {
        //sacar info de seguimiento
        // Obtener los usuarios a los que sigue el usuario identificado
        let following = await Follow.find({ 'user': identityUserId })
            .select({ "_id": 0, "__v": 0, user: 0 });

        // Actualmente no estás obteniendo los seguidores, así que lo dejamos como false
        let followers = await Follow.find({ 'followed': identityUserId })
            .select({ "_id": 0, "__v": 0, user: 0 });;

        //Procesar array de identificadores
        let followingClean = []
        following.forEach(follow => {
            followingClean.push(follow.followed)
        });

        let followersClean = []
        followers.forEach(follow => {
            followersClean.push(follow.user)
        });


        return {
            following: followingClean,
            followers: followersClean
        };
    } catch (error) {
        // Manejar errores
        console.error(error);
        return {
            following: [],
            followers: false
        };
    }
}


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