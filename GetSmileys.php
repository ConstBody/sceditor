<?php

/**
 * Сервис возвращающий список смайлов
 */
class Forum_Service_GetSmileys
{
    /**
     * Экземпляр сервиса
     * @var Forum_Service_GetSmileys
     */
    protected static $_instance = null;

    /**
     * Возвращает экземпляр сервиса
     * @return Forum_Service_GetSmileys
     */
    public static function getInstance()
    {
        if (null === self::$_instance) {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    /**
     * Возвращает список старых смайлов
     * @return array
     */
    public function getOldSmileys()
    {
        return array(array('regexp' => '~([\s]+|<br[\s\/]*>|^):[-]?\)~i', 'name' => 'smiley', 'tooltip' => 'Улыбающийся'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^);[-]?\)~i', 'name' => 'wink', 'tooltip' => 'Подмигивающий'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):[-]?D~','name' => 'cheesy', 'tooltip' => 'Веселый'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^);[-]?D~i', 'name' => 'grin', 'tooltip' => 'Смеющийся'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):[-]?\(~i', 'name' => 'sad', 'tooltip' => 'Грустный'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):[-]?\\\~i', 'name' => 'undecided', 'tooltip' => 'Непонимающий'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):[-]?o~i', 'name' => 'shocked', 'tooltip' => 'Шокированный'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^)>:[-]?\(~i', 'name' => 'angry', 'tooltip' => 'Злой'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^)8[-]?\)~i', 'name' => 'cool', 'tooltip' => 'Крутой'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):\\\'[-]?\(~i', 'name' => 'cry', 'tooltip' => 'Плачущий'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):-\[~i', 'name' => 'embarrassed', 'tooltip' => 'Обеспокоенный'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):-\*~i', 'name' => 'kiss', 'tooltip' => 'Целующий'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):-X~i', 'name' => 'lipsrsealed', 'tooltip' => 'Рот на замке'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^)::\)~i','name' => 'rolleyes', 'tooltip' => 'Строит глазки'),
                     array('regexp' => '~([\s]+|<br[\s\/]*>|^):[-]?P~', 'name' => 'tongue', 'tooltip' => 'Показывает язык'));
    }

    /**
     * Возвращает список смайлов
     * @return array
     */
    public function getSmileys()
    {
        return array(array('name' => 'smiley', 'tooltip' => 'Улыбающийся'),
                     array('name' => 'wink', 'tooltip' => 'Подмигивающий'),
                     array('name' => 'cheesy', 'tooltip' => 'Веселый'),
                     array('name' => 'grin', 'tooltip' => 'Смеющийся'),
                     array('name' => 'sad', 'tooltip' => 'Грустный'),
                     array('name' => 'undecided', 'tooltip' => 'Непонимающий'),
                     array('name' => 'shocked', 'tooltip' => 'Шокированный'),
                     array('name' => 'angry', 'tooltip' => 'Злой'),
                     array('name' => 'cool', 'tooltip' => 'Крутой'),
                     array('name' => 'cry', 'tooltip' => 'Плачущий'),
                     array('name' => 'embarrassed', 'tooltip' => 'Обеспокоенный'),
                     array('name' => 'kiss', 'tooltip' => 'Целующий'),
                     array('name' => 'lipsrsealed', 'tooltip' => 'Рот на замке'),
                     array('name' => 'rolleyes', 'tooltip' => 'Строит глазки'),
                     array('name' => 'tongue', 'tooltip' => 'Показывает язык'),
                     array('name' => 'yes', 'tooltip' => 'Согласный'),
                     array('name' => 'good', 'tooltip' => 'Нравится'),
                     array('name' => 'rofl', 'tooltip' => 'Под столом'),
                     array('name' => 'pleasantry', 'tooltip' => 'Кавычки'),
                     array('name' => 'yahoo', 'tooltip' => 'Кричащий'),
                     array('name' => 'pioner', 'tooltip' => 'Пионер'),
                     array('name' => 'wall', 'tooltip' => 'Бъющийся об стену'),
                     array('name' => 'thinking', 'tooltip' => 'Думающий'),
                     array('name' => 'unknow', 'tooltip' => 'Незнающий'),
                     array('name' => 'popcorn', 'tooltip' => 'Жующий попкорн'),
                     array('name' => 'ushanka', 'tooltip' => 'Быдло'),
                     array('name' => 'figa', 'tooltip' => 'Фига'),
                     array('name' => 'dance', 'tooltip' => 'Танцующий'),
                     array('name' => 'molitva', 'tooltip' => 'Молящийся'),
                     array('name' => 'negative', 'tooltip' => 'Не нравится'),
                     array('name' => 'thanks', 'tooltip' => 'Благодарный'),
                     array('name' => 'fight', 'tooltip' => 'Расстреливающий'),
                     array('name' => 'hi', 'tooltip' => 'Приветствующий'),
                     array('name' => 'bad', 'tooltip' => 'Рыгающий'),
                     array('name' => 'bita', 'tooltip' => 'С битой'),
                     array('name' => 'isterika', 'tooltip' => 'Истеричный'),
                     array('name' => 'clapping', 'tooltip' => 'Хлопающий'),
                     array('name' => 'cleanglasses', 'tooltip' => 'В очках'),
                     array('name' => 'crazy', 'tooltip' => 'Сумашедший'),
                     array('name' => 'boyan', 'tooltip' => 'Боян'),
                     array('name' => 'demand', 'tooltip' => 'Требующий'),
                     array('name' => 'diablo', 'tooltip' => 'Дъявол'),
                     array('name' => 'facepalm', 'tooltip' => 'Позор'),
                     array('name' => 'drinks', 'tooltip' => 'Выпивающий'));
    }
}