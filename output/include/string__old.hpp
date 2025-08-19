#ifndef __STRING_H__
#define __STRING_H__

#define NUM_STR js::number left, const js::string &right
#define STR_NUM const js::string &left, js::number right
#define STR_STR const js::string &left, const js::string &right

// @todo use +=/-=/*= etc operators instead

double stod_noexep(const std::string& s);

js::string operator+(NUM_STR);
js::string operator+(STR_NUM);

js::number operator-(STR_STR);
js::number operator-(NUM_STR);
js::number operator-(STR_NUM);

js::number operator*(STR_STR);
js::number operator*(NUM_STR);
js::number operator*(STR_NUM);

js::number operator/(STR_STR);
js::number operator/(NUM_STR);
js::number operator/(STR_NUM);

#endif // __STRING_H__